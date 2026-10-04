import { NextRequest } from "next/server";
import { db } from "@/db";
import { monitoringRecords, monitoringObservations, crops } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, getPagination } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPagination(searchParams);

    const [totalResult] = await db
      .select({ count: count() })
      .from(monitoringRecords)
      .where(eq(monitoringRecords.userId, session.userId));

    const results = await db
      .select({
        monitoring: monitoringRecords,
        cropName: crops.name,
        cropVariety: crops.variety,
      })
      .from(monitoringRecords)
      .leftJoin(crops, eq(monitoringRecords.cropId, crops.id))
      .where(eq(monitoringRecords.userId, session.userId))
      .orderBy(desc(monitoringRecords.createdAt))
      .limit(limit)
      .offset(offset);

    // Get observation counts
    const enrichedResults = await Promise.all(
      results.map(async (r) => {
        const [obsCount] = await db
          .select({ count: count() })
          .from(monitoringObservations)
          .where(eq(monitoringObservations.monitoringId, r.monitoring.id));
        return { ...r, observationCount: obsCount.count };
      })
    );

    return successResponse({
      monitoring: enrichedResults,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    console.error("Get monitoring error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { cropId, title, alertRules } = body;

    if (!cropId || !title?.trim()) {
      return errorResponse("Crop ID and title are required");
    }

    const [crop] = await db
      .select()
      .from(crops)
      .where(and(eq(crops.id, cropId), eq(crops.userId, session.userId)))
      .limit(1);

    if (!crop) return errorResponse("Crop not found", 404);

    const [record] = await db
      .insert(monitoringRecords)
      .values({
        userId: session.userId,
        cropId,
        title: title.trim(),
        alertRules: alertRules || {
          newDisease: true,
          repeatedDisease: true,
          healthyToDiseased: true,
          consecutiveConcerning: 3,
        },
      })
      .returning();

    return successResponse(record, 201);
  } catch (error) {
    console.error("Create monitoring error:", error);
    return serverErrorResponse();
  }
}