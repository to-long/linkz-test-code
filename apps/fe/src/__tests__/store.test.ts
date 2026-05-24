import "./setup";
import { describe, test, expect, beforeEach } from "bun:test";
import { useAppStore } from "../lib/store";

describe("AppStore", () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
    useAppStore.setState({ locale: "en", theme: "light" });
  });

  describe("locale", () => {
    test("defaults to 'en'", () => {
      expect(useAppStore.getState().locale).toBe("en");
    });

    test("setLocale updates locale and persists to localStorage", () => {
      useAppStore.getState().setLocale("zh");
      expect(useAppStore.getState().locale).toBe("zh");
      expect(localStorage.getItem("locale")).toBe("zh");
    });

    test("setLocale to 'id' works", () => {
      useAppStore.getState().setLocale("id");
      expect(useAppStore.getState().locale).toBe("id");
      expect(localStorage.getItem("locale")).toBe("id");
    });
  });

  describe("theme", () => {
    test("defaults to 'light'", () => {
      expect(useAppStore.getState().theme).toBe("light");
    });

    test("toggleTheme switches from light to dark", () => {
      useAppStore.getState().toggleTheme();
      expect(useAppStore.getState().theme).toBe("dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    test("toggleTheme switches from dark to light", () => {
      useAppStore.setState({ theme: "dark" });
      useAppStore.getState().toggleTheme();
      expect(useAppStore.getState().theme).toBe("light");
    });

    test("setTheme sets specific theme", () => {
      useAppStore.getState().setTheme("dark");
      expect(useAppStore.getState().theme).toBe("dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });
});
