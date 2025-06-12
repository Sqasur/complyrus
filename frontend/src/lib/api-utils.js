// Modern Next.js API utilities
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.stack = stack;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ApiResponse {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

// Next.js API wrapper
export function asyncHandler(fn) {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            errors: error.errors,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
}

// Success response helper
export function successResponse(data, message = "success", status = 200) {
  return NextResponse.json(new ApiResponse(status, data, message), { status });
}

// Error response helper
export function errorResponse(message, status = 400, errors = []) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}
