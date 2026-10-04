import { db } from "@/db";
import { users, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        mobile: users.mobile,
        avatarUrl: users.avatarUrl,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) return unauthorizedResponse();

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.userId))
      .limit(1);

    return successResponse({ user, preferences: prefs || null });
  } catch (error) {
    console.error("Get me error:", error);
    return serverErrorResponse();
  }
}