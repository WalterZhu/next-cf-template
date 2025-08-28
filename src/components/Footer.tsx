export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 项目信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              项目信息
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Next.js + Cloudflare 模板</p>
              <p>支持 SSR 和 Edge Runtime</p>
            </div>
          </div>

          {/* 功能特性 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              功能特性
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>地理位置检测</li>
              <li>KV 存储</li>
              <li>边缘计算</li>
              <li>SSR 渲染</li>
            </ul>
          </div>

          {/* 技术栈 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              技术栈
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Next.js 15</li>
              <li>React 19</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>

          {/* 链接 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              链接
            </h3>
            <div className="space-y-2">
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Next.js 文档
              </a>
              <a 
                href="https://developers.cloudflare.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cloudflare 开发者
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                源码仓库
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>© 2024</span>
              <span>·</span>
              <span>由 Claude Code 重构</span>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-400">
                Powered by Cloudflare Workers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}