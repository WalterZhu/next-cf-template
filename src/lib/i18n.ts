import { getCurrentUserIdFromHeaders } from "./user-utils";
import { getUserSettings } from "./session";
import type { Language } from "@/types/language";

// 翻译数据类型
type TranslationData = {
  [key: string]: string | TranslationData;
};

// 翻译缓存
const translationCache = new Map<Language, TranslationData>();

// 加载翻译文件
async function loadTranslations(locale: Language): Promise<TranslationData> {
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    const translations = await import(`../../locales/${locale}.json`);
    const data = translations.default || translations;
    translationCache.set(locale, data);
    return data;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // 回退到中文
    if (locale !== "zh-CN") {
      return loadTranslations("zh-CN");
    }
    return {};
  }
}

// 获取用户语言偏好
async function getUserLanguage(): Promise<Language> {
  try {
    const userId = await getCurrentUserIdFromHeaders();
    if (userId) {
      const settings = await getUserSettings(userId);
      return settings?.languagePreference || 'zh-CN';
    }
    return 'zh-CN';
  } catch (error) {
    console.error('Error getting user language:', error);
    return 'zh-CN';
  }
}

// 获取翻译文本
export async function t(key: string, locale?: Language): Promise<string> {
  const currentLocale = locale || (await getUserLanguage());
  const translations = await loadTranslations(currentLocale);

  // 支持嵌套键值，如 "common.home"
  const keys = key.split(".");
  let value: TranslationData | string | undefined = translations;

  for (const k of keys) {
    if (typeof value === "object" && value !== null && k in value) {
      value = (value as TranslationData)[k];
    } else {
      value = undefined;
      break;
    }
  }

  return typeof value === "string" ? value : key;
}

