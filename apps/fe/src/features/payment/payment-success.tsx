import { useNavigate, useSearchParams } from "react-router-dom";
import * as m from "../../paraglide/messages.js";
import { useLocale } from "../../lib/i18n";
import { formatPrice } from "../../lib/format";
import { AppLayout } from "../../components/app-layout";
import { usePaymentStatus } from "./use-payment-status";

export function PaymentSuccess() {
  const navigate = useNavigate();
  useLocale();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { status, reservation, payment } = usePaymentStatus(sessionId);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center bg-[#e8f0ed] dark:bg-[#1e2e25] py-8 sm:py-16 px-4 sm:px-20 gap-6 sm:gap-8">
        {(status === "loading" || status === "pending") && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-[#2D5E3A] border-t-transparent rounded-full" />
            <p className="text-[#1B3A28] dark:text-white font-medium">
              {status === "loading"
                ? m.confirming_reservation()
                : m.payment_received()}
            </p>
            {status === "pending" && (
              <p className="text-sm text-[#7A9A80]">
                {m.usually_few_seconds()}
              </p>
            )}
          </div>
        )}

        {status === "success" && (
          <>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2D5E3A]">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-[28px] font-bold text-[#1B3A28] dark:text-white">
                {m.booking_confirmed()}
              </h1>
              <p className="text-sm text-[#7A9A80]">
                {m.reservation_success()}
              </p>
            </div>

            <div className="w-full max-w-xl bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#D6DDD0] dark:border-[#444]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold text-[#1B3A28] dark:text-white">
                    {m.your_tickets()}
                  </span>
                  {payment?.id && (
                    <span className="text-[11px] text-[#7A9A80]">
                      {m.reference()}: {payment.id.slice(0, 12).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F0FDF4] dark:bg-[#1a3a28] text-[#2D5E3A] text-xs font-semibold">
                  {m.paid()}
                </span>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                {reservation?.seatLabels && (
                  <div>
                    <span className="text-[11px] font-medium text-[#7A9A80] uppercase tracking-wider">{m.seats_label()}</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(Array.isArray(reservation.seatLabels) ? reservation.seatLabels : [reservation.seatLabel || "—"]).map((label: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-[#F0FDF4] dark:bg-[#1a3a28] text-[#2D5E3A] text-xs font-semibold border border-[#D6DDD0] dark:border-[#444]">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-[#7A9A80] uppercase tracking-wider">{m.event()}</span>
                    <p className="text-sm font-medium text-[#1B3A28] dark:text-white mt-1">Cinema Hall A</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-[#7A9A80] uppercase tracking-wider">{m.date()}</span>
                    <p className="text-sm font-medium text-[#1B3A28] dark:text-white mt-1">2026-05-25</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-[#7A9A80] uppercase tracking-wider">{m.time()}</span>
                    <p className="text-sm font-medium text-[#1B3A28] dark:text-white mt-1">7:30 PM</p>
                  </div>
                </div>

                <div className="h-px bg-[#D6DDD0] dark:bg-[#444]" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#7A9A80]">{m.total_paid()}</span>
                  <span className="text-xl font-bold text-[#2D5E3A]">
                    {payment?.amount ? formatPrice(payment.amount) : "$0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 bg-white dark:bg-[#2a2a2a] text-[#1B3A28] dark:text-[#d0d0d0] border border-[#D6DDD0] dark:border-[#444] px-4 sm:px-5 py-2.5 sm:py-3 rounded text-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                {m.back_to_home()}
              </button>
              <button
                onClick={() => navigate("/tickets")}
                className="flex items-center justify-center gap-2 bg-[#2D5E3A] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded text-sm font-medium hover:bg-[#1B3A28] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2" />
                  <path d="M13 17v2" />
                  <path d="M13 11v2" />
                </svg>
                {m.view_my_tickets()}
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
