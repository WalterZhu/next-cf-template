import NextAuth from "next-auth";
import type { Language } from "./language";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // NextAuth 内部使用字符串
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string; // NextAuth 内部使用字符串
    name?: string | null;
    email?: string | null;
  }
}