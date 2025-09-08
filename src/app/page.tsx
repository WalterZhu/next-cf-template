export default function Home() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎使用 Next.js + Cloudflare 模板
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            这是一个现代化的 Web 应用模板，集成了 Next.js 15、React 19、TypeScript 和 Cloudflare Workers，
            支持边缘计算、SSR 渲染和全栈开发。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">🚀 核心特性</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Next.js 15 与 React 19</li>
              <li>• TypeScript 类型安全</li>
              <li>• Tailwind CSS 样式框架</li>
              <li>• Cloudflare Workers 边缘计算</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">🛠 功能模块</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 地理位置检测</li>
              <li>• KV 数据存储</li>
              <li>• 服务端渲染 (SSR)</li>
              <li>• Edge Runtime 支持</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
