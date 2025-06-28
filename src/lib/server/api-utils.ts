import { dev } from "$app/environment";
import { json } from "@sveltejs/kit";

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Standard error response interface
 */
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  timestamp: string;
  code?: string;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
  
  return json(response, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "max-age=3600"
    }
  });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  message?: string,
  code?: string
) {
  const response: ApiError = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    code
  };
  
  return json(response, {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

/**
 * Create a standardized not found response
 */
export function createNotFoundResponse(resource: string, message?: string) {
  return createErrorResponse(
    `${resource} not found`,
    404,
    message || `The requested ${resource} was not found`,
    "NOT_FOUND"
  );
}

/**
 * Create a standardized validation error response
 */
export function createValidationErrorResponse(field: string, message?: string) {
  return createErrorResponse(
    `Validation error for ${field}`,
    400,
    message || `The ${field} field is invalid`,
    "VALIDATION_ERROR"
  );
}

/**
 * Create a standardized unauthorized response
 */
export function createUnauthorizedResponse(message?: string) {
  return createErrorResponse(
    "Unauthorized",
    401,
    message || "Authentication required",
    "UNAUTHORIZED"
  );
}

/**
 * Create a standardized forbidden response
 */
export function createForbiddenResponse(message?: string) {
  return createErrorResponse(
    "Forbidden",
    403,
    message || "You don't have permission to access this resource",
    "FORBIDDEN"
  );
}

/**
 * Validate required parameters
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]): string | null {
  for (const param of required) {
    if (!params[param] || params[param] === "") {
      return param;
    }
  }
  return null;
}

/**
 * Validate string length
 */
export function validateStringLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Validate numeric range
 */
export function validateNumericRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(headers: Record<string, string> = {}) {
  return {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

/**
 * Handle API errors with proper logging
 */
export function handleApiError(error: any, context: string): ApiError {
  console.error(`API Error in ${context}:`, error);
  
  // Don't expose internal errors to clients
  const isDevelopment = dev;
  
  return {
    success: false,
    error: isDevelopment ? error.message : "Internal server error",
    message: isDevelopment ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    code: "INTERNAL_ERROR"
  };
}

/**
 * Rate limiting utility (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Create a rate limited response
 */
export function createRateLimitResponse() {
  return createErrorResponse(
    "Rate limit exceeded",
    429,
    "Too many requests. Please try again later.",
    "RATE_LIMIT_EXCEEDED"
  );
} 