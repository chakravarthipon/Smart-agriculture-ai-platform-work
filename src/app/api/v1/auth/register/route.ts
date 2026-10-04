import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken } from "@/lib/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, mobile } = body;

    if (!fullName || !email || !password) {
      return errorResponse("Full name, email, and password are required");
    }

    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format");
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        mobile: mobile?.trim() || null,
      })
      .returning();

    await db.insert(userPreferences).values({
      userId: newUser.id,
    });

    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
    });

    return successResponse(
      {
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
        token,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return serverErrorResponse();
  }
}