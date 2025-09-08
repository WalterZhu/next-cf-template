import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { getCurrentUserIdFromHeaders } from "@/lib/user-utils";
import { getUserSettings } from "@/lib/session";
import NextAuthSessionProvider from "@/components/SessionProvider";
import NotificationProvider from "@/components/NotificationProvider";
import type { Language } from "@/types/language";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js + Cloudflare 模板",
  description: "基于 Next.js 15 和 Cloudflare Workers 的现代 Web 应用模板",
};

// Cloudflare Web Analytics 组件
function CloudflareAnalytics() {
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "46bc0361a0094407a248bdb389d2e89f"}'
    />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 获取用户语言偏好，默认为中文
  let currentLanguage: Language = 'zh-CN';
  try {
    const userId = await getCurrentUserIdFromHeaders();
    if (userId) {
      const settings = await getUserSettings(userId);
      currentLanguage = settings?.languagePreference || 'zh-CN';
    }
  } catch (error) {
    console.error('Error getting user language:', error);
  }

  return (
    <html lang={currentLanguage}>
      <head>
        <CloudflareAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextAuthSessionProvider>
          <NotificationProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </NotificationProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
