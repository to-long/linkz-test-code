import { useTheme } from "../lib/theme";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center h-9 rounded-full border border-[#D6DDD0] dark:border-[#444] bg-white dark:bg-[#2a2a2a] p-1 cursor-pointer ${className || ""}`}
    >
      <div className={`flex items-center justify-center w-8 h-7 rounded-[14px] transition-all ${
        theme === "light" ? "bg-white shadow-sm" : ""
      }`}>
        <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </div>
      <div className={`flex items-center justify-center w-8 h-7 rounded-[14px] transition-all ${
        theme === "dark" ? "bg-[#444] shadow-sm" : ""
      }`}>
        <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>
    </button>
  );
}
