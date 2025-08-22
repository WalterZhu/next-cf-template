export interface GeoBlockConfig {
  blockedCountries: string[];
  allowedCountries?: string[];
  blockMessage?: string;
  redirectUrl?: string;
}

export const defaultGeoConfig: GeoBlockConfig = {
  blockedCountries: ['CN', 'RU'], // ISO 3166-1 alpha-2 国家代码
  blockMessage: 'Sorry, access from your region is currently restricted.',
};

export function isRegionBlocked(
  country?: string | null
): boolean {
  const config = getGeoConfigFromEnv();
  if (!country) return false;

  // 如果设置了允许列表，只允许列表中的国家
  if (config.allowedCountries && config.allowedCountries.length > 0) {
    return !config.allowedCountries.includes(country.toUpperCase());
  }

  // 检查国家是否被屏蔽
  return config.blockedCountries.includes(country.toUpperCase());
}

export function createBlockedResponse(
  country: string
) {
  const config = getGeoConfigFromEnv();
  const message = config.blockMessage || defaultGeoConfig.blockMessage;
  
  if (config.redirectUrl) {
    return Response.redirect(config.redirectUrl, 302);
  }

  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Restricted</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 500px;
          }
          .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
          }
          .message {
            color: #6b7280;
            line-height: 1.6;
          }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🚫</div>
            <h1 class="title">Access Restricted</h1>
            <p class="message">${message}</p>
            <p class="message" style="font-size: 0.875rem; margin-top: 1rem;">
                Region: ${country}
            </p>
        </div>
    </body>
    </html>
    `,
    { 
      status: 403, 
      headers: { 
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate'
      } 
    }
  );
}

// 从环境变量解析地区屏蔽配置
export function getGeoConfigFromEnv(): GeoBlockConfig {
  return {
    blockedCountries: process.env.GEO_BLOCKED_COUNTRIES?.split(',').map(c => c.trim()) || defaultGeoConfig.blockedCountries,
    allowedCountries: process.env.GEO_ALLOWED_COUNTRIES?.split(',').map(c => c.trim()),
    blockMessage: process.env.GEO_BLOCK_MESSAGE || defaultGeoConfig.blockMessage,
    redirectUrl: process.env.GEO_REDIRECT_URL,
  };
}

// Cloudflare Workers 专用：从请求对象获取地理信息
export function getGeoInfoFromCloudflare(request: Request): { country?: string } {
  // 从 CF-IPCountry 头部获取国家信息
  const country = request.headers.get('CF-IPCountry');
  
  // 尝试从 cf 对象获取国家信息（如果可用）
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  
  return {
    country: country || cf?.country || undefined
  };
}