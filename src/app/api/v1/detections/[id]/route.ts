import { NextRequest } from "next/server";
import { db } from "@/db";
import { detections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-utils";
import { getDiseaseByKey } from "@/lib/disease-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;

    const [detection] = await db
      .select()
      .from(detections)
      .where(and(eq(detections.id, id), eq(detections.userId, session.userId)))
      .limit(1);

    if (!detection) return notFoundResponse("Detection not found");

    const diseaseInfo = getDiseaseByKey(detection.predictedClass);

    return successResponse({
      ...detection,
      disease_info: diseaseInfo || null,
    });
  } catch (error) {
    console.error("Get detection error:", error);
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
      .from(detections)
      .where(and(eq(detections.id, id), eq(detections.userId, session.userId)))
      .limit(1);

    if (!existing) return notFoundResponse("Detection not found");

    await db.delete(detections).where(eq(detections.id, id));
    return successResponse({ message: "Detection deleted" });
  } catch (error) {
    console.error("Delete detection error:", error);
    return serverErrorResponse();
  }
}