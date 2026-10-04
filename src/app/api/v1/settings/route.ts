import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-utils";

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
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.userId))
      .limit(1);

    return successResponse({ user, preferences: prefs || null });
  } catch (error) {
    console.error("Get settings error:", error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { section } = body;

    if (section === "profile") {
      const { fullName, mobile } = body;
      if (!fullName?.trim()) return errorResponse("Full name is required");

      const [updated] = await db
        .update(users)
        .set({
          fullName: fullName.trim(),
          mobile: mobile?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId))
        .returning();

      return successResponse({
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        mobile: updated.mobile,
      });
    }

    if (section === "preferences") {
      const { language, theme, emailNotifications, pushNotifications, detectionAlerts, monitoringAlerts } = body;

      const [existing] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, session.userId))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(userPreferences)
          .set({
            language: language ?? existing.language,
            theme: theme ?? existing.theme,
            emailNotifications: emailNotifications ?? existing.emailNotifications,
            pushNotifications: pushNotifications ?? existing.pushNotifications,
            detectionAlerts: detectionAlerts ?? existing.detectionAlerts,
            monitoringAlerts: monitoringAlerts ?? existing.monitoringAlerts,
            updatedAt: new Date(),
          })
          .where(eq(userPreferences.userId, session.userId))
          .returning();

        return successResponse(updated);
      } else {
        const [created] = await db
          .insert(userPreferences)
          .values({
            userId: session.userId,
            language: language || "en",
            theme: theme || "light",
            emailNotifications: emailNotifications ?? true,
            pushNotifications: pushNotifications ?? true,
            detectionAlerts: detectionAlerts ?? true,
            monitoringAlerts: monitoringAlerts ?? true,
          })
          .returning();

        return successResponse(created);
      }
    }

    if (section === "password") {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return errorResponse("Current and new passwords are required");
      }
      if (newPassword.length < 8) {
        return errorResponse("New password must be at least 8 characters");
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user) return unauthorizedResponse();

      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) return errorResponse("Current password is incorrect");

      const newHash = await hashPassword(newPassword);
      await db
        .update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, session.userId));

      return successResponse({ message: "Password updated successfully" });
    }

    return errorResponse("Invalid settings section");
  } catch (error) {
    console.error("Update settings error:", error);
    return serverErrorResponse();
  }
}