import { NextRequest } from "next/server";
import { db } from "@/db";
import { crops, detections } from "@/db/schema";
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

    const [crop] = await db
      .select()
      .from(crops)
      .where(and(eq(crops.id, id), eq(crops.userId, session.userId)))
      .limit(1);

    if (!crop) return notFoundResponse("Crop not found");

    const cropDetections = await db
      .select()
      .from(detections)
      .where(eq(detections.cropId, id))
      .orderBy(desc(detections.createdAt))
      .limit(20);

    return successResponse({ crop, detections: cropDetections });
  } catch (error) {
    console.error("Get crop error:", error);
    return serverErrorResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(crops)
      .where(and(eq(crops.id, id), eq(crops.userId, session.userId)))
      .limit(1);

    if (!existing) return notFoundResponse("Crop not found");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.variety !== undefined) updateData.variety = body.variety?.trim() || null;
    if (body.plantingDate !== undefined) updateData.plantingDate = body.plantingDate ? new Date(body.plantingDate) : null;
    if (body.fieldName !== undefined) updateData.fieldName = body.fieldName?.trim() || null;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;

    const [updated] = await db
      .update(crops)
      .set(updateData)
      .where(eq(crops.id, id))
      .returning();

    return successResponse(updated);
  } catch (error) {
    console.error("Update crop error:", error);
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
      .from(crops)
      .where(and(eq(crops.id, id), eq(crops.userId, session.userId)))
      .limit(1);

    if (!existing) return notFoundResponse("Crop not found");

    await db.delete(crops).where(eq(crops.id, id));
    return successResponse({ message: "Crop deleted" });
  } catch (error) {
    console.error("Delete crop error:", error);
    return serverErrorResponse();
  }
}