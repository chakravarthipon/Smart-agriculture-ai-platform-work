import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse, getPagination } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPagination(searchParams);
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "true";

    let query = eq(notifications.userId, session.userId);

    if (type) {
      query = and(query, eq(notifications.type, type))!;
    }
    if (unreadOnly) {
      query = and(query, eq(notifications.isRead, false))!;
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(query);

    const [unreadCount] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, session.userId), eq(notifications.isRead, false))
      );

    const results = await db
      .select()
      .from(notifications)
      .where(query)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return successResponse({
      notifications: results,
      unreadCount: unreadCount.count,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return serverErrorResponse();
  }
}