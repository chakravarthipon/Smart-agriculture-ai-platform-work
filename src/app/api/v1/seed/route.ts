import { db } from "@/db";
import { diseaseInformation } from "@/db/schema";
import { DISEASE_DATABASE } from "@/lib/disease-data";
import { successResponse, serverErrorResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    // Clear existing data
    await db.delete(diseaseInformation);

    // Insert all disease information
    for (const disease of DISEASE_DATABASE) {
      await db.insert(diseaseInformation).values({
        diseaseKey: disease.diseaseKey,
        diseaseName: disease.diseaseName,
        cropName: disease.cropName,
        category: disease.category,
        severity: disease.severity,
        overview: disease.overview,
        symptoms: disease.symptoms,
        causes: disease.causes,
        conditions: disease.conditions,
        prevention: disease.prevention,
        management: disease.management,
        suggestedActions: disease.suggestedActions,
        isHealthy: disease.isHealthy,
      });
    }

    return successResponse({
      message: "Database seeded successfully",
      count: DISEASE_DATABASE.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return serverErrorResponse("Failed to seed database");
  }
}