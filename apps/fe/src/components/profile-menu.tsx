import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as m from "../paraglide/messages.js";
import { useLocale } from "../lib/i18n";
import { useSession, useSignOut } from "../lib/auth-client";
import { getInitials } from "../lib/format";
import { useClickOutside } from "../lib/hooks/use-click-outside";

export function ProfileMenu() {
  const { data: session } = useSession();
  useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, useCallback(() => setOpen(false), []));

  if (!session?.user) return null;

  const user = session.user;
  const initials = getInitials(user.name || user.email || "U");

  const clerkSignOut = useSignOut();
  async function handleLogout() {
    await clerkSignOut();
    navigate("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 pl-1 pr-2.5 rounded-full bg-[#F3F4F6] dark:bg-[#333]"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2D5E3A] text-white text-[11px] font-bold">
          {initials}
        </div>
        <svg className="w-3.5 h-3.5 text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[260px] bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] z-50 overflow-hidden">
          <div className="flex items-center gap-3 p-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2D5E3A] text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#1B3A28] dark:text-white truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-[#7A9A80] font-sans truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div className="h-px bg-[#D6DDD0] dark:bg-[#444]" />

          <button
            onClick={() => { setOpen(false); navigate("/tickets"); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-[#333] text-left"
          >
            <svg className="w-4 h-4 text-[#1B3A28] dark:text-[#d0d0d0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2M13 17v2M13 11v2" />
            </svg>
            <span className="flex-1 text-[13px] font-medium text-[#1B3A28] dark:text-[#d0d0d0]">
              {m.my_tickets()}
            </span>
            <span className="text-[11px] font-semibold text-[#7A9A80]">3</span>
          </button>

          <div className="h-px bg-[#D6DDD0] dark:bg-[#444]" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
          >
            <svg className="w-4 h-4 text-[#CC3314]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[13px] font-medium text-[#CC3314]">
              {m.logout()}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
