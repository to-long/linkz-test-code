import { create } from "zustand";
import type { Locale } from "./i18n";

type Theme = "light" | "dark";

interface AppStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  locale: (localStorage.getItem("locale") as Locale) || "en",
  setLocale: (locale) => {
    localStorage.setItem("locale", locale);
    set({ locale });
  },
  theme: (localStorage.getItem("theme") as Theme) || "light",
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));
