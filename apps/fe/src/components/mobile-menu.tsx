import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as m from "../paraglide/messages.js";
import { useLocale, localeLabels, type Locale } from "../lib/i18n";
import { useTheme } from "../lib/theme";
import { useSession, signOut } from "../lib/auth-client";
import { getInitials } from "../lib/format";

export function MobileMenu() {
  const { data: session } = useSession();
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const user = session?.user;
  const initials = user ? getInitials(user.name || user.email || "U") : "";

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-[#D6DDD0] dark:border-[#444] bg-white dark:bg-[#2a2a2a]"
      >
        <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${open ? "opacity-100 pointer-events-auto backdrop-blur-sm" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        onClick={() => setOpen(false)}
      />

      <div className={`fixed top-0 right-0 z-50 h-full w-[80%] max-w-[320px] bg-white dark:bg-[#2a2a2a] shadow-xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center gap-3 p-4 border-b border-[#D6DDD0] dark:border-[#444]">
          {user ? (
            <>
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2D5E3A] text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-[#1B3A28] dark:text-white truncate">{user.name}</span>
                <span className="text-[11px] text-[#7A9A80] truncate">{user.email}</span>
              </div>
            </>
          ) : (
            <div className="flex-1" />
          )}
          <button onClick={() => setOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] shrink-0">
            <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-65px)]">
          <div className="flex-1 overflow-y-auto">

            <div className="p-2">
              {user && (
                <button
                  onClick={() => { setOpen(false); navigate("/tickets"); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#333] text-left"
                >
                  <svg className="w-5 h-5 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2M13 17v2M13 11v2" />
                  </svg>
                  <span className="text-sm font-medium text-[#1B3A28] dark:text-[#d0d0d0]">{m.my_tickets()}</span>
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-[#D6DDD0] dark:border-[#444] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#D6DDD0] dark:border-[#444] hover:bg-gray-50 dark:hover:bg-[#333]"
              >
                {theme === "light" ? (
                  <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                )}
              </button>
              <div className="flex gap-1 flex-1 bg-[#F5F3EE] dark:bg-[#333] rounded-lg p-1">
                {(Object.keys(localeLabels) as Locale[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setLocale(key)}
                    className={`flex-1 py-1.5 rounded-md text-[12px] font-medium text-center transition-colors ${
                      key === locale
                        ? "bg-white dark:bg-[#2a2a2a] text-[#1B3A28] dark:text-white shadow-sm"
                        : "text-[#7A9A80] hover:text-[#1B3A28] dark:hover:text-white"
                    }`}
                  >
                    {localeLabels[key].code}
                  </button>
                ))}
              </div>
            </div>

            {user && (
              <button
                onClick={async () => { await signOut(); navigate("/login"); }}
                className="flex items-center gap-3 w-full py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
              >
                <svg className="w-5 h-5 text-[#CC3314]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="text-sm font-medium text-[#CC3314]">{m.logout()}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
