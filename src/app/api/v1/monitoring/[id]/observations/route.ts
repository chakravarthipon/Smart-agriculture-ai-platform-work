import { NextRequest } from "next/server";
import { db } from "@/db";
import { monitoringRecords, monitoringObservations, detections, notifications } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-utils";
import { getDiseaseByKey } from "@/lib/disease-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(monitoringRecords)
      .where(
        and(eq(monitoringRecords.id, id), eq(monitoringRecords.userId, session.userId))
      )
      .limit(1);

    if (!record) return notFoundResponse("Monitoring record not found");

    const body = await request.json();
    const { detectionId, notes } = body;

    if (!detectionId) {
      return errorResponse("Detection ID is required");
    }

    const [detection] = await db
      .select()
      .from(detections)
      .where(
        and(eq(detections.id, detectionId), eq(detections.userId, session.userId))
      )
      .limit(1);

    if (!detection) return errorResponse("Detection not found", 404);

    const [observation] = await db
      .insert(monitoringObservations)
      .values({
        monitoringId: id,
        detectionId,
        imagePath: detection.imagePath,
        predictedClass: detection.predictedClass,
        diseaseName: detection.diseaseName,
        confidence: detection.confidence,
        notes: notes?.trim() || null,
      })
      .returning();

    // Check alert rules
    const alertRules = record.alertRules as Record<string, unknown> | null;

    if (alertRules) {
      // Get previous observations to check for patterns
      const recentObs = await db
        .select()
        .from(monitoringObservations)
        .where(eq(monitoringObservations.monitoringId, id))
        .orderBy(desc(monitoringObservations.observedAt))
        .limit(5);

      const diseaseInfo = getDiseaseByKey(detection.predictedClass);
      const isDiseased = diseaseInfo && !diseaseInfo.isHealthy;

      // Alert: New disease detected
      if (isDiseased && alertRules.newDisease && recentObs.length > 0) {
        const prevObs = recentObs.find((o) => o.id !== observation.id);
        const prevDisease = prevObs ? getDiseaseByKey(prevObs.predictedClass || "") : null;
        if (prevDisease?.isHealthy || !prevObs) {
          await db.insert(notifications).values({
            userId: session.userId,
            type: "monitoring_alert",
            title: `New Disease Alert: ${detection.diseaseName}`,
            message: `${detection.diseaseName} was detected in monitoring "${record.title}". Previously the crop appeared healthy.`,
            metadata: { monitoringId: id, observationId: observation.id },
          });
        }
      }

      // Alert: Repeated disease classifications
      if (isDiseased && alertRules.repeatedDisease) {
        const consecutiveDiseased = recentObs.filter((o) => {
          const info = getDiseaseByKey(o.predictedClass || "");
          return info && !info.isHealthy;
        }).length;

        const threshold = (alertRules.consecutiveConcerning as number) || 3;
        if (consecutiveDiseased >= threshold) {
          await db.insert(notifications).values({
            userId: session.userId,
            type: "monitoring_alert",
            title: `Persistent Disease: ${detection.diseaseName}`,
            message: `${detection.diseaseName} has been detected in ${consecutiveDiseased} consecutive observations for "${record.title}". Consider taking action.`,
            metadata: { monitoringId: id, consecutiveCount: consecutiveDiseased },
          });
        }
      }
    }

    return successResponse(observation, 201);
  } catch (error) {
    console.error("Create observation error:", error);
    return serverErrorResponse();
  }
}