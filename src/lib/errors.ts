import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_STATUS_CODES,
} from "@/types/errors";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export type ErrorCode = keyof typeof ERROR_CODES;

// 创建标准错误对象（不依赖Response，可在任何地方使用）
export function createError(
  code: ErrorCode,
  customMessage?: string,
  details?: any,
  path?: string
): ApiErrorResponse {
  const errorCode = ERROR_CODES[code];
  const message = customMessage || ERROR_MESSAGES[errorCode] || "未知错误";

  return {
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
    ...(path && { path }),
  };
}

// 创建API响应（专门用于API路由）
export function createErrorResponse(
  code: ErrorCode,
  customMessage?: string,
  details?: any,
  path?: string
): Response {
  const statusCode = ERROR_STATUS_CODES[ERROR_CODES[code]] || 500;
  const errorObj = createError(code, customMessage, details, path);

  return Response.json(errorObj, { status: statusCode });
}

// 抛出错误异常（用于业务逻辑中）
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, customMessage?: string, details?: any) {
    const errorCode = ERROR_CODES[code];
    const message = customMessage || ERROR_MESSAGES[errorCode] || "未知错误";

    super(message);
    this.name = "AppError";
    this.code = errorCode;
    this.statusCode = ERROR_STATUS_CODES[errorCode] || 500;
    this.details = details;
  }

  toJSON(): ApiErrorResponse {
    return createError(this.code as ErrorCode, this.message, this.details);
  }
}

// 便捷方法 - 返回Response（用于API）
export const ApiErrors = {
  // 认证错误
  unauthorized: (message?: string, details?: any) =>
    createErrorResponse("AUTH_REQUIRED", message, details),

  invalidToken: (message?: string, details?: any) =>
    createErrorResponse("AUTH_INVALID_TOKEN", message, details),

  forbidden: (message?: string, details?: any) =>
    createErrorResponse("AUTH_INSUFFICIENT_PERMISSIONS", message, details),

  // 请求错误
  badRequest: (message?: string, details?: any) =>
    createErrorResponse("GENERAL_BAD_REQUEST", message, details),

  missingParams: (params: string[], details?: any) =>
    createErrorResponse(
      "REQUEST_MISSING_PARAMS",
      `缺少参数: ${params.join(", ")}`,
      details
    ),

  invalidParams: (message?: string, details?: any) =>
    createErrorResponse("REQUEST_INVALID_PARAMS", message, details),

  // 资源错误
  notFound: (resource?: string, details?: any) =>
    createErrorResponse(
      "RESOURCE_NOT_FOUND",
      resource ? `${resource}不存在` : undefined,
      details
    ),

  conflict: (message?: string, details?: any) =>
    createErrorResponse("RESOURCE_CONFLICT", message, details),

  // 服务错误
  internal: (message?: string, details?: any) =>
    createErrorResponse("GENERAL_INTERNAL_ERROR", message, details),

  kvError: (operation?: string, details?: any) =>
    createErrorResponse(
      "SERVICE_KV_ERROR",
      operation ? `KV${operation}操作失败` : undefined,
      details
    ),

  dbError: (operation?: string, details?: any) =>
    createErrorResponse(
      "SERVICE_DATABASE_ERROR",
      operation ? `数据库${operation}操作失败` : undefined,
      details
    ),
};

// 便捷方法 - 抛出异常（用于业务逻辑）
export const AppErrors = {
  // 认证错误
  unauthorized: (message?: string, details?: any): never => {
    throw new AppError("AUTH_REQUIRED", message, details);
  },

  invalidToken: (message?: string, details?: any): never => {
    throw new AppError("AUTH_INVALID_TOKEN", message, details);
  },

  forbidden: (message?: string, details?: any): never => {
    throw new AppError("AUTH_INSUFFICIENT_PERMISSIONS", message, details);
  },

  // 请求错误
  badRequest: (message?: string, details?: any): never => {
    throw new AppError("GENERAL_BAD_REQUEST", message, details);
  },

  missingParams: (params: string[], details?: any): never => {
    throw new AppError(
      "REQUEST_MISSING_PARAMS",
      `缺少参数: ${params.join(", ")}`,
      details
    );
  },

  invalidParams: (message?: string, details?: any): never => {
    throw new AppError("REQUEST_INVALID_PARAMS", message, details);
  },

  // 资源错误
  notFound: (resource?: string, details?: any): never => {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      resource ? `${resource}不存在` : undefined,
      details
    );
  },

  conflict: (message?: string, details?: any): never => {
    throw new AppError("RESOURCE_CONFLICT", message, details);
  },

  // 服务错误
  internal: (message?: string, details?: any): never => {
    throw new AppError("GENERAL_INTERNAL_ERROR", message, details);
  },

  kvError: (operation?: string, details?: any): never => {
    throw new AppError(
      "SERVICE_KV_ERROR",
      operation ? `KV${operation}操作失败` : undefined,
      details
    );
  },

  dbError: (operation?: string, details?: any): never => {
    throw new AppError(
      "SERVICE_DATABASE_ERROR",
      operation ? `数据库${operation}操作失败` : undefined,
      details
    );
  },
};
