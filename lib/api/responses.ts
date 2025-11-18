import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  message?: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", "Authentication required", 401);
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse("Forbidden", "Access denied", 403);
}

export function notFoundResponse(resource: string): NextResponse<ApiResponse> {
  return errorResponse("Not found", `${resource} not found`, 404);
}

export function validationErrorResponse(details: string): NextResponse<ApiResponse> {
  return errorResponse("Validation error", details, 400);
}

export function serverErrorResponse(error: Error | string): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : String(error);
  return errorResponse("Internal server error", message, 500);
}
