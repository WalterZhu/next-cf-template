import type { User } from "next-auth";
import type { Language } from "./language";

// 扩展的用户Session接口，包含session相关字段
export interface UserSession extends Omit<User, 'id'> {
  id: number; // 重写为数字类型
  loginTime: string;
  lastActivityDate?: string; // YYYY-MM-DD 格式，记录最后活跃日期
}

// 用户设置接口 - 包含所有个性化配置
export interface UserSettings {
  userId: number;
  languagePreference: Language;
  theme?: string;
  timezone?: string;
  avatarUrl?: string;
}