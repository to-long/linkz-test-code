import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as m from "../paraglide/messages.js";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/auth-client";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { ProfileMenu } from "./profile-menu";
import { MobileMenu } from "./mobile-menu";

export function AppLayout({ children }: { children: ReactNode }) {
  useLocale();
  const navigate = useNavigate();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#1a1a1a]">
      <header className="sticky top-0 z-50 flex items-center justify-between px-3 sm:px-8 py-3 bg-[#F5F3EE] dark:bg-[#252525] border-b border-[#D6DDD0] dark:border-[#444]">
        <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0" onClick={() => navigate("/")}>
          <div className="relative w-7 h-7 shrink-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2D5E3A] to-[#7A9A80]" />
            <svg className="absolute inset-0 m-auto w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-lg font-bold text-[#1B3A28] dark:text-white leading-tight truncate">
              {m.app_name()}
            </span>
            <span className="text-[11px] italic text-[#7A9A80] font-sans leading-tight truncate hidden sm:block">
              {m.app_tagline()}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {session?.user && <ProfileMenu />}
        </div>

        <MobileMenu />
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
