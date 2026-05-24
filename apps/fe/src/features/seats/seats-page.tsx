import { useNavigate } from "react-router-dom";
import * as m from "../../paraglide/messages.js";
import { useLocale } from "../../lib/i18n";
import { useSession } from "../../lib/auth-client";
import { formatPrice } from "../../lib/format";
import { chunkArray } from "../../lib/utils";
import { AppLayout } from "../../components/app-layout";
import { useSeats } from "./use-seats";
import { useSeatActions } from "./use-seat-actions";
import type { Seat } from "./types";

export function SeatsPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  useLocale();
  const { seats, loading, error, fetchSeats } = useSeats();
  const { handleHold, handleRelease, actionError } = useSeatActions(fetchSeats);

  const displayError = error || actionError;
  const availableCount = seats.filter((s) => s.status === "available").length;
  const myHeldSeats = seats.filter(
    (s) => s.status === "held" && s.heldBy === session?.user?.id
  );
  const totalPrice = myHeldSeats.reduce((sum, s) => sum + s.price, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#e8f0ed] dark:bg-[#1e2e25]">
          <p className="text-[#7A9A80]">
            {m.loading_seats()}
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center bg-[#e8f0ed] dark:bg-[#1e2e25] py-6 sm:py-8 px-4 sm:px-20 gap-5 sm:gap-6">
        {displayError && (
          <div className="w-full max-w-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">
            {displayError}
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl sm:text-[28px] font-bold text-[#1B3A28] dark:text-white">
            {m.choose_your_seat()}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A9A80] font-sans truncate max-w-full">
            {m.cinema_info()}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full max-w-[480px] h-1.5 rounded-sm bg-gradient-to-b from-[#7A9A80] to-[#F5F3EE] dark:to-[#2a2a2a]" />
          <span className="text-[11px] font-semibold tracking-[4px] text-[#7A9A80]">
            {m.screen()}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:gap-4">
          {chunkArray(seats, 4).map((row, i) => (
            <div key={i} className="flex gap-2 sm:gap-4 justify-center">
              {row.map((seat) => {
                const isAvailable = seat.status === "available";
                const isMineHeld =
                  seat.status === "held" && seat.heldBy === session?.user?.id;
                const isMineReserved =
                  seat.status === "reserved" && seat.reservedBy === session?.user?.id;
                const isMine = isMineHeld || isMineReserved;

                let bgColor = "bg-[#D6DDD0] dark:bg-[#3a4a3f]";
                let borderColor = "border-[#C5C5CB] dark:border-[#555]";
                let iconColor = "text-[#7A9A80]";
                let labelColor = "text-[#1B3A28] dark:text-[#d0d0d0]";
                let opacity = "";

                if (isMine) {
                  bgColor = "bg-[#2D5E3A]";
                  borderColor = "border-[#1B3A28]";
                  iconColor = "text-white";
                  labelColor = "text-white";
                } else if (isAvailable) {
                  bgColor = "bg-white dark:bg-[#2a2a2a]";
                  borderColor = "border-[#2D5E3A]";
                } else {
                  opacity = "opacity-60";
                }

                return (
                  <button
                    key={seat.id}
                    onClick={() => {
                      if (isMineHeld) handleRelease(seat.id);
                      else if (isAvailable) handleHold(seat.id);
                    }}
                    disabled={!isAvailable && !isMineHeld}
                    className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-xl border-[1.5px] transition-all ${bgColor} ${borderColor} ${opacity} ${
                      isAvailable
                        ? "cursor-pointer hover:shadow-md"
                        : isMineHeld
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                    </svg>
                    <span className={`text-[11px] font-semibold ${labelColor}`}>
                      {seat.label}
                    </span>
                    {(isAvailable || isMineHeld) && (
                      <span className={`text-[10px] font-semibold ${isAvailable ? "text-[#2D5E3A]" : "text-white"}`}>
                        {formatPrice(seat.price)}
                      </span>
                    )}
                    {isMineReserved && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-5 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] rounded border-[1.5px] border-[#2D5E3A] bg-white dark:bg-[#2a2a2a]" />
            <span className="text-xs text-[#1B3A28] dark:text-[#d0d0d0]">
              {m.available()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] rounded border-[1.5px] border-[#1B3A28] bg-[#2D5E3A]" />
            <span className="text-xs text-[#1B3A28] dark:text-[#d0d0d0]">
              {m.selected()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] rounded border-[1.5px] border-[#C5C5CB] bg-[#D6DDD0] dark:bg-[#3a4a3f] opacity-60" />
            <span className="text-xs text-[#1B3A28] dark:text-[#d0d0d0]">
              {m.occupied()}
            </span>
          </div>
        </div>

        <div className="w-full flex items-center justify-between bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] py-3 sm:py-4 px-3 sm:px-6 gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#1B3A28] dark:text-white truncate">
              {m.seats_available({ count: availableCount })}
            </span>
            <span className="text-[11px] sm:text-xs text-[#7A9A80] font-sans truncate">
              {m.select_up_to()}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] font-medium text-[#7A9A80]">
                {m.total()}
              </span>
              <span className="text-base sm:text-xl font-bold text-[#1B3A28] dark:text-white">
                {formatPrice(totalPrice)}
              </span>
            </div>
            {myHeldSeats.length > 0 && (
              <button
                onClick={() => navigate("/payment", { state: { seatIds: myHeldSeats.map(s => s.id) } })}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#2D5E3A] text-white text-xs sm:text-sm font-semibold px-3 sm:px-6 py-2.5 sm:py-3 rounded hover:bg-[#1B3A28] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2" />
                  <path d="M13 17v2" />
                  <path d="M13 11v2" />
                </svg>
                {m.confirm_booking()}
              </button>
            )}
          </div>
        </div>

        {myHeldSeats.length > 0 && (
          <p className="text-sm text-[#7A9A80] text-center">
            {m.hold_expires_note()}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
