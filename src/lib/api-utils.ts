import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  );
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  return { page, limit, offset: (page - 1) * limit };
}