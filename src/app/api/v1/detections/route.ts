import { NextRequest } from "next/server";
import { db } from "@/db";
import { detections } from "@/db/schema";
import { eq, desc, sql, and, ilike, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  getPagination,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPagination(searchParams);
    const cropId = searchParams.get("cropId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query = and(eq(detections.userId, session.userId));

    if (cropId) {
      query = and(query, eq(detections.cropId, cropId));
    }

    if (search) {
      query = and(
        query,
        sql`(${detections.diseaseName} ILIKE ${`%${search}%`} OR ${detections.cropName} ILIKE ${`%${search}%`} OR ${detections.predictedClass} ILIKE ${`%${search}%`})`
      );
    }

    if (status) {
      query = and(query, eq(detections.status, status));
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(detections)
      .where(query);

    const orderBy =
      sortOrder === "asc"
        ? sql`${detections.createdAt} ASC`
        : sql`${detections.createdAt} DESC`;

    const results = await db
      .select()
      .from(detections)
      .where(query)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return successResponse({
      detections: results,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    console.error("Get detections error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return errorResponse("Detection ID is required");

    const [existing] = await db
      .select()
      .from(detections)
      .where(
        and(eq(detections.id, id), eq(detections.userId, session.userId))
      )
      .limit(1);

    if (!existing) return errorResponse("Detection not found", 404);

    await db.delete(detections).where(eq(detections.id, id));

    return successResponse({ message: "Detection deleted successfully" });
  } catch (error) {
    console.error("Delete detection error:", error);
    return serverErrorResponse();
  }
}