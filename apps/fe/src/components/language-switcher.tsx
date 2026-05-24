import { useState, useRef, useCallback } from "react";
import { useLocale, localeLabels, type Locale } from "../lib/i18n";
import { useClickOutside } from "../lib/hooks/use-click-outside";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, useCallback(() => setOpen(false), []));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-[#D6DDD0] bg-white dark:bg-[#2a2a2a] dark:border-[#444] text-[#1B3A28] dark:text-[#d0d0d0] text-[13px] font-medium"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {localeLabels[locale].code}
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[180px] bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-[#D6DDD0] dark:border-[#444] p-2 z-50">
          {(Object.keys(localeLabels) as Locale[]).map((key) => (
            <button
              key={key}
              onClick={() => { setLocale(key); setOpen(false); }}
              className={`flex items-center gap-3 w-full h-10 px-3 rounded-lg text-left ${
                key === locale
                  ? "bg-[#F0FDF4] dark:bg-[#1a3a28]"
                  : "hover:bg-gray-50 dark:hover:bg-[#333]"
              }`}
            >
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-[#1B3A28] dark:text-[#d0d0d0]">
                  {localeLabels[key].name}
                </span>
                <span className="text-[11px] text-[#9CA3AF]">
                  {localeLabels[key].code}
                </span>
              </div>
              {key === locale && (
                <svg className="w-4 h-4 text-[#2D5E3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
