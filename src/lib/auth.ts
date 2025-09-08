import { NextAuthOptions } from "next-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Language } from "@/types/language";
import type { UserSession, UserSettings } from "@/types/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { env } = getCloudflareContext();
          const user = await env.DEV_D1.prepare(
            "SELECT id, email, name, password_hash, language_preference FROM users WHERE email = ?"
          ).bind(credentials.email).first() as { 
            id: number; 
            email: string; 
            name: string | null; 
            password_hash: string | null;
            language_preference: string | null;
          } | null;

          if (!user || !user.password_hash) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id.toString(), // NextAuth 要求 id 为字符串
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          const { env } = getCloudflareContext();
          
          // 查询用户设置
          const userSettings = await env.DEV_D1.prepare(`
            SELECT 
              language_preference,
              theme,
              timezone,
              avatar_url
            FROM users 
            WHERE id = ?
          `).bind(parseInt(token.sub)).first() as { 
            language_preference: string | null;
            theme: string | null;
            timezone: string | null;
            avatar_url: string | null;
          } | null;
          
          // 创建或更新KV中的session数据
          const sessionData: UserSession = {
            id: parseInt(token.sub),
            email: session.user.email,
            name: session.user.name,
            loginTime: new Date().toISOString()
          };
          
          // 创建或更新用户设置
          const settingsData: UserSettings = {
            userId: parseInt(token.sub),
            languagePreference: (userSettings?.language_preference || 'zh-CN') as Language,
            theme: userSettings?.theme || 'light',
            timezone: userSettings?.timezone || 'Asia/Shanghai',
            ...(userSettings?.avatar_url && { avatarUrl: userSettings.avatar_url })
          };
          
          // 存储到KV
          await Promise.all([
            env.DEV_KV.put(
              `session:${token.sub}`,
              JSON.stringify(sessionData),
              { expirationTtl: 7 * 24 * 60 * 60 } // 7天
            ),
            env.DEV_KV.put(
              `settings:${token.sub}`,
              JSON.stringify(settingsData)
            )
          ]);
          
        } catch (error) {
          console.error('Error storing session in KV:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/signin',
  },
};