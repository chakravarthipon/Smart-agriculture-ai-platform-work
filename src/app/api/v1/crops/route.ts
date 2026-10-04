import { NextRequest } from "next/server";
import { db } from "@/db";
import { crops } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
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
      .from(crops)
      .where(eq(crops.userId, session.userId));

    const results = await db
      .select()
      .from(crops)
      .where(eq(crops.userId, session.userId))
      .orderBy(desc(crops.createdAt))
      .limit(limit)
      .offset(offset);

    return successResponse({
      crops: results,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    console.error("Get crops error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { name, variety, plantingDate, fieldName, location, notes } = body;

    if (!name?.trim()) {
      return errorResponse("Crop name is required");
    }

    const [crop] = await db
      .insert(crops)
      .values({
        userId: session.userId,
        name: name.trim(),
        variety: variety?.trim() || null,
        plantingDate: plantingDate ? new Date(plantingDate) : null,
        fieldName: fieldName?.trim() || null,
        location: location?.trim() || null,
        notes: notes?.trim() || null,
      })
      .returning();

    return successResponse(crop, 201);
  } catch (error) {
    console.error("Create crop error:", error);
    return serverErrorResponse();
  }
}