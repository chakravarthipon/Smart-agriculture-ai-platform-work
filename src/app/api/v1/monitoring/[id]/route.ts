import { NextRequest } from "next/server";
import { db } from "@/db";
import { monitoringRecords, monitoringObservations, crops } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;

    const [record] = await db
      .select({
        monitoring: monitoringRecords,
        cropName: crops.name,
        cropVariety: crops.variety,
      })
      .from(monitoringRecords)
      .leftJoin(crops, eq(monitoringRecords.cropId, crops.id))
      .where(
        and(eq(monitoringRecords.id, id), eq(monitoringRecords.userId, session.userId))
      )
      .limit(1);

    if (!record) return notFoundResponse("Monitoring record not found");

    const observations = await db
      .select()
      .from(monitoringObservations)
      .where(eq(monitoringObservations.monitoringId, id))
      .orderBy(desc(monitoringObservations.observedAt));

    return successResponse({ ...record, observations });
  } catch (error) {
    console.error("Get monitoring detail error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;

    const [existing] = await db
      .select()
      .from(monitoringRecords)
      .where(
        and(eq(monitoringRecords.id, id), eq(monitoringRecords.userId, session.userId))
      )
      .limit(1);

    if (!existing) return notFoundResponse("Monitoring record not found");

    await db.delete(monitoringRecords).where(eq(monitoringRecords.id, id));
    return successResponse({ message: "Monitoring record deleted" });
  } catch (error) {
    console.error("Delete monitoring error:", error);
    return serverErrorResponse();
  }
}