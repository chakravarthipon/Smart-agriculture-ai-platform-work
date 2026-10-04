import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    if (id === "read-all") {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, session.userId), eq(notifications.isRead, false)));
      return successResponse({ message: "All notifications marked as read" });
    }

    const [existing] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.userId)))
      .limit(1);

    if (!existing) return notFoundResponse("Notification not found");

    const [updated] = await db
      .update(notifications)
      .set({ isRead: body.isRead ?? true })
      .where(eq(notifications.id, id))
      .returning();

    return successResponse(updated);
  } catch (error) {
    console.error("Update notification error:", error);
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
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.userId)))
      .limit(1);

    if (!existing) return notFoundResponse("Notification not found");

    await db.delete(notifications).where(eq(notifications.id, id));
    return successResponse({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return serverErrorResponse();
  }
}