import { overwriteGetLocale } from "../paraglide/runtime.js";
import { useAppStore } from "./store";

export type Locale = "en" | "zh" | "id";

overwriteGetLocale(() => useAppStore.getState().locale);

export function useLocale() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  return { locale, setLocale };
}

export const localeLabels: Record<Locale, { name: string; code: string }> = {
  en: { name: "English", code: "EN" },
  zh: { name: "中文", code: "ZH" },
  id: { name: "Indonesia", code: "ID" },
};
