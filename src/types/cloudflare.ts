// Cloudflare Workers 环境类型定义

export interface CloudflareEnv {
  // KV命名空间
  DEV_KV: KVNamespace;
  
  // 其他环境变量
  NEXTJS_ENV?: string;
  
  // 地理屏蔽配置
  GEO_BLOCKED_COUNTRIES?: string;
  GEO_ALLOWED_COUNTRIES?: string;
  GEO_BLOCK_MESSAGE?: string;
  GEO_REDIRECT_URL?: string;
}

export interface CloudflareRequest {
  cf?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    asn?: string;
    colo?: string;
  };
}

// KV操作相关类型
export interface KVGetResponse<T = unknown> {
  key: string;
  value: T | null;
  found: boolean;
}

export interface KVPutRequest {
  key: string;
  value: unknown;
  ttl?: number;
}

export interface KVResponse {
  success: boolean;
  key: string;
  message: string;
}

// 地理信息类型
export interface GeoInfo {
  country?: string;
}

// 错误响应类型
export interface ApiError {
  error: string;
}