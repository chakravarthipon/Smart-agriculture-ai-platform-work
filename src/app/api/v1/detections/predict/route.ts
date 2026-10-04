import { NextRequest } from "next/server";
import { db } from "@/db";
import { detections, notifications, crops } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-utils";
import { getDiseaseByKey } from "@/lib/disease-data";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const ML_INFERENCE_URL =
  process.env.ML_INFERENCE_URL || "http://127.0.0.1:8000";

type MLPrediction = {
  class_index: number;
  label: string;
  display_name: string;
  confidence: number;
  confidence_percent: number;
};

type MLResponse = {
  success: boolean;
  model_version: string;
  architecture: string;
  prediction: MLPrediction;
  top_predictions: MLPrediction[];
};

export async function POST(request: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Authenticate user
    // ---------------------------------------------------------
    const session = await getSession();

    if (!session) {
      return unauthorizedResponse();
    }

    // ---------------------------------------------------------
    // 2. Read uploaded form data
    // ---------------------------------------------------------
    const formData = await request.formData();

    const file = formData.get("image") as File | null;
    const cropId = formData.get("cropId") as string | null;

    if (!file) {
      return errorResponse("No image file provided");
    }

    // ---------------------------------------------------------
    // 3. Validate file type
    // ---------------------------------------------------------
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        "Only JPEG and PNG images are supported"
      );
    }

    // ---------------------------------------------------------
    // 4. Validate file size
    // ---------------------------------------------------------
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return errorResponse(
        "File size must be less than 10MB"
      );
    }

    // ---------------------------------------------------------
    // 5. Convert uploaded file to Buffer
    // ---------------------------------------------------------
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // ---------------------------------------------------------
    // 6. Validate that the file is a real image
    // ---------------------------------------------------------
    let imageMetadata;

    try {
      imageMetadata = await sharp(imageBuffer).metadata();

      if (!imageMetadata.width || !imageMetadata.height) {
        return errorResponse("Invalid image file");
      }
    } catch {
      return errorResponse(
        "Could not process the image. Please try a different file."
      );
    }

    // ---------------------------------------------------------
    // 7. Generate detection ID
    // ---------------------------------------------------------
    const detectionId = uuidv4();

    // ---------------------------------------------------------
    // 8. Save original uploaded image
    // ---------------------------------------------------------
    const ext = file.name.split(".").pop() || "jpg";

    const imageFilename = `${detectionId}.${ext}`;

    const imageDir = path.join(
      UPLOAD_DIR,
      "detections"
    );

    await fs.mkdir(imageDir, {
      recursive: true,
    });

    const imagePath = path.join(
      imageDir,
      imageFilename
    );

    await fs.writeFile(
      imagePath,
      imageBuffer
    );

    const relativeImagePath =
      `/uploads/detections/${imageFilename}`;

    // ---------------------------------------------------------
    // 9. Send image to real ML inference service
    // ---------------------------------------------------------
    const mlFormData = new FormData();

    mlFormData.append(
      "file",
      new Blob(
        [new Uint8Array(imageBuffer)],
        {
          type: file.type,
        }
      ),
      file.name
    );

    let mlResponse: Response;

    try {
      mlResponse = await fetch(
        `${ML_INFERENCE_URL}/predict`,
        {
          method: "POST",
          body: mlFormData,
        }
      );
    } catch (error) {
      console.error(
        "ML inference service connection error:",
        error
      );

      return serverErrorResponse(
        "ML inference service is unavailable. Please make sure the ML service is running."
      );
    }

    // ---------------------------------------------------------
    // 10. Validate ML service response
    // ---------------------------------------------------------
    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();

      console.error(
        "ML inference service returned an error:",
        errorText
      );

      return serverErrorResponse(
        "ML inference service failed to process the image."
      );
    }

    const mlResult =
      (await mlResponse.json()) as MLResponse;

    if (
      !mlResult.success ||
      !mlResult.prediction ||
      !Array.isArray(mlResult.top_predictions)
    ) {
      console.error(
        "Invalid ML inference response:",
        mlResult
      );

      return serverErrorResponse(
        "Invalid response received from the ML inference service."
      );
    }

    // ---------------------------------------------------------
    // 11. Convert ML predictions to application format
    // ---------------------------------------------------------
    const predictions = mlResult.top_predictions
      .map((prediction) => ({
        class: prediction.label,
        confidence: prediction.confidence,
      }))
      .sort(
        (a, b) => b.confidence - a.confidence
      )
      .slice(0, 3);

    const topPrediction = {
      class: mlResult.prediction.label,
      confidence: mlResult.prediction.confidence,
    };

    // ---------------------------------------------------------
    // 12. Get disease information
    // ---------------------------------------------------------
    const diseaseInfo =
      getDiseaseByKey(topPrediction.class);

    const cropName =
      diseaseInfo?.cropName || "Unknown";

    const diseaseName =
      diseaseInfo?.diseaseName ||
      topPrediction.class;

    // ---------------------------------------------------------
    // 13. Get crop name from cropId if provided
    // ---------------------------------------------------------
    let associatedCropName = cropName;

    if (cropId) {
      const [crop] = await db
        .select()
        .from(crops)
        .where(
          and(
            eq(crops.id, cropId),
            eq(crops.userId, session.userId)
          )
        )
        .limit(1);

      if (crop) {
        associatedCropName = crop.name;
      }
    }

    // ---------------------------------------------------------
    // 14. Save ML detection to database
    // ---------------------------------------------------------
    const [detection] = await db
      .insert(detections)
      .values({
        id: detectionId,
        userId: session.userId,
        cropId: cropId || null,
        imagePath: relativeImagePath,
        predictedClass: topPrediction.class,
        diseaseName,
        cropName: associatedCropName,
        confidence: topPrediction.confidence,
        status: "completed",

        topPredictions: predictions,

        recommendations:
          diseaseInfo?.suggestedActions || [],

        modelVersion:
          mlResult.model_version || "v1.0",

        metadata: {
          imageWidth: imageMetadata.width,
          imageHeight: imageMetadata.height,
          originalFilename: file.name,
          fileSize: file.size,

          mlModel: {
            version:
              mlResult.model_version || "v1.0",
            architecture:
              mlResult.architecture || "mobilenetv2",
            inferenceService:
              ML_INFERENCE_URL,
          },
        },
      })
      .returning();

    // ---------------------------------------------------------
    // 15. Create notification for disease detection
    // ---------------------------------------------------------
    if (
      diseaseInfo &&
      !diseaseInfo.isHealthy
    ) {
      await db
        .insert(notifications)
        .values({
          userId: session.userId,
          type: "detection_alert",

          title:
            `Disease Detected: ${diseaseName}`,

          message:
            `Your ${associatedCropName} plant may have ${diseaseName} with ${Math.round(
              topPrediction.confidence * 100
            )}% confidence. Review the detection for recommended actions.`,

          metadata: {
            detectionId: detection.id,
            cropName: associatedCropName,
          },
        });
    }

    // ---------------------------------------------------------
    // 16. Return response to frontend
    // ---------------------------------------------------------
    return successResponse({
      detection_id: detection.id,

      crop: associatedCropName,

      predicted_class:
        topPrediction.class,

      disease_name:
        diseaseName,

      confidence:
        topPrediction.confidence,

      status: "completed",

      top_predictions:
        predictions.map((prediction) => ({
          class: prediction.class,

          disease_name:
            getDiseaseByKey(
              prediction.class
            )?.diseaseName ||
            prediction.class,

          confidence:
            prediction.confidence,
        })),

      recommendations:
        diseaseInfo?.suggestedActions || [],

      disease_info: diseaseInfo
        ? {
          overview:
            diseaseInfo.overview,

          symptoms:
            diseaseInfo.symptoms,

          prevention:
            diseaseInfo.prevention,

          management:
            diseaseInfo.management,

          severity:
            diseaseInfo.severity,

          category:
            diseaseInfo.category,

          isHealthy:
            diseaseInfo.isHealthy,
        }
        : null,

      image_url:
        relativeImagePath,

      created_at:
        detection.createdAt,
    });
  } catch (error) {
    console.error(
      "Prediction error:",
      error
    );

    return serverErrorResponse(
      "Failed to process image for disease detection"
    );
  }
}