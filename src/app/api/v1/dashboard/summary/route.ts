import { db } from "@/db";
import { detections, crops, monitoringRecords } from "@/db/schema";
import { eq, count, sql, and, gte, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const userId = session.userId;

    const [totalScans] = await db
      .select({ count: count() })
      .from(detections)
      .where(eq(detections.userId, userId));

    const [healthyCount] = await db
      .select({ count: count() })
      .from(detections)
      .where(
        and(
          eq(detections.userId, userId),
          sql`${detections.predictedClass} LIKE '%healthy%'`
        )
      );

    const [diseaseCount] = await db
      .select({ count: count() })
      .from(detections)
      .where(
        and(
          eq(detections.userId, userId),
          sql`${detections.predictedClass} NOT LIKE '%healthy%' AND ${detections.predictedClass} NOT LIKE '%Background%'`
        )
      );

    const [totalCrops] = await db
      .select({ count: count() })
      .from(crops)
      .where(eq(crops.userId, userId));

    const [activeMonitoring] = await db
      .select({ count: count() })
      .from(monitoringRecords)
      .where(
        and(
          eq(monitoringRecords.userId, userId),
          eq(monitoringRecords.status, "active")
        )
      );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [recentScans] = await db
      .select({ count: count() })
      .from(detections)
      .where(
        and(
          eq(detections.userId, userId),
          gte(detections.createdAt, weekAgo)
        )
      );

    const diseaseDistribution = await db
      .select({
        diseaseName: detections.diseaseName,
        count: count(),
      })
      .from(detections)
      .where(eq(detections.userId, userId))
      .groupBy(detections.diseaseName)
      .orderBy(desc(count()));

    const monthlyTrend = await db
      .select({
        month: sql<string>`TO_CHAR(${detections.createdAt}, 'YYYY-MM')`,
        total: count(),
        healthy: sql<number>`SUM(CASE WHEN ${detections.predictedClass} LIKE '%healthy%' THEN 1 ELSE 0 END)`,
        diseased: sql<number>`SUM(CASE WHEN ${detections.predictedClass} NOT LIKE '%healthy%' AND ${detections.predictedClass} NOT LIKE '%Background%' THEN 1 ELSE 0 END)`,
      })
      .from(detections)
      .where(eq(detections.userId, userId))
      .groupBy(sql`TO_CHAR(${detections.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${detections.createdAt}, 'YYYY-MM')`)
      .limit(6);

    return successResponse({
      totalScans: totalScans.count,
      healthyPlants: healthyCount.count,
      diseaseCases: diseaseCount.count,
      totalCrops: totalCrops.count,
      activeMonitoring: activeMonitoring.count,
      recentScans: recentScans.count,
      diseaseDistribution,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return serverErrorResponse();
  }
}