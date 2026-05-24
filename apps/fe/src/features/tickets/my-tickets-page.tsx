import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as m from "../../paraglide/messages.js";
import { useLocale } from "../../lib/i18n";
import { formatPrice } from "../../lib/format";
import { AppLayout } from "../../components/app-layout";
import { useTickets } from "./use-tickets";
import { downloadTicketPdf } from "./ticket-pdf";
import { QrModal } from "./qr-modal";
import type { Ticket, Tab } from "./types";

export function MyTicketsPage() {
  const navigate = useNavigate();
  useLocale();
  const { loading, activeTab, setActiveTab, filteredTickets } = useTickets();
  const [qrTicket, setQrTicket] = useState<Ticket | null>(null);

  const tabs: { key: Tab; label: () => string }[] = [
    { key: "upcoming", label: m.upcoming },
    { key: "past", label: m.past },
    { key: "all", label: m.all },
  ];

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center bg-[#e8f0ed] dark:bg-[#1e2e25] py-6 sm:py-8 px-4 sm:px-20 gap-5 sm:gap-6">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl sm:text-[28px] font-bold text-[#1B3A28] dark:text-white">
            {m.my_tickets_title()}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A9A80] font-sans">
            {m.my_tickets_subtitle()}
          </p>
        </div>

        <div className="w-full max-w-2xl flex items-center justify-between gap-2">
          <div className="flex gap-1 bg-white dark:bg-[#2a2a2a] rounded-lg border border-[#D6DDD0] dark:border-[#444] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#2D5E3A] text-white"
                    : "text-[#7A9A80] hover:text-[#1B3A28] dark:hover:text-white"
                }`}
              >
                {tab.label()}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#2D5E3A] text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded hover:bg-[#1B3A28] transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {m.book_now()}
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#7A9A80]">{m.loading()}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <svg className="w-12 h-12 text-[#D6DDD0] dark:text-[#444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2M13 17v2M13 11v2" />
            </svg>
            <p className="text-sm text-[#7A9A80]">{m.no_tickets()}</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] overflow-hidden"
              >
                <div className={`flex flex-col items-center justify-center gap-1.5 w-16 sm:w-24 shrink-0 ${
                  ticket.status === "upcoming" ? "bg-[#2D5E3A]" : "bg-[#9CA3AF]"
                }`}>
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2M13 17v2M13 11v2" />
                  </svg>
                  <span className="text-[8px] sm:text-[9px] font-bold text-white tracking-[1px]">
                    {ticket.status === "upcoming" ? "VALID" : "USED"}
                  </span>
                </div>
                <div className="flex-1 px-3 sm:px-5 py-3 sm:py-4 flex flex-col gap-2.5 sm:gap-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm sm:text-base font-bold text-[#1B3A28] dark:text-white truncate">
                        {ticket.eventName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0FDF4] dark:bg-[#1a3a28] text-[#2D5E3A] text-xs font-medium w-fit">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                          <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                        </svg>
                        {m.seats_count({ count: ticket.seatLabels.length })}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 ${
                        ticket.status === "upcoming"
                          ? "bg-[#E8F0ED] dark:bg-[#1a3a28] text-[#2D5E3A]"
                          : "bg-[#F5F3EE] dark:bg-[#333] text-[#7A9A80]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.status === "upcoming" ? "bg-[#2D5E3A]" : "bg-[#9CA3AF]"
                      }`} />
                      {ticket.status === "upcoming" ? m.upcoming() : m.past()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-[#7A9A80]">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {ticket.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {ticket.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                        <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                      </svg>
                      {ticket.seatLabels.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#D6DDD0] dark:border-[#444] gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#1B3A28] dark:text-white truncate">
                      {m.total()}: {formatPrice(ticket.totalAmount)}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button onClick={() => downloadTicketPdf(ticket)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded border border-[#D6DDD0] dark:border-[#444] text-[11px] sm:text-xs font-medium text-[#1B3A28] dark:text-[#d0d0d0] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {m.pdf()}
                      </button>
                      <button onClick={() => setQrTicket(ticket)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-[#2D5E3A] text-white text-[11px] sm:text-xs font-medium hover:bg-[#1B3A28] transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <rect x="7" y="7" width="3" height="3" />
                          <rect x="14" y="7" width="3" height="3" />
                          <rect x="7" y="14" width="3" height="3" />
                        </svg>
                        {m.show_qr()}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {qrTicket && <QrModal ticket={qrTicket} onClose={() => setQrTicket(null)} />}
    </AppLayout>
  );
}
