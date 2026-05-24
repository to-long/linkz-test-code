import type { Ticket } from "./types";

export function generateQrGrid(seed: number) {
  return Array.from({ length: 21 }, (_, r) =>
    Array.from({ length: 21 }, (_, c) => {
      if (r < 7 && c < 7) return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) ? 1 : 0;
      if (r < 7 && c > 13) return (r === 0 || r === 6 || c === 14 || c === 20 || (r >= 2 && r <= 4 && c >= 16 && c <= 18)) ? 1 : 0;
      if (r > 13 && c < 7) return (r === 14 || r === 20 || c === 0 || c === 6 || (r >= 16 && r <= 18 && c >= 2 && c <= 4)) ? 1 : 0;
      return ((r * 7 + c * 13 + seed) % 3) !== 0 ? 1 : 0;
    })
  );
}

export function QrModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const seed = ticket.id.charCodeAt(0) + ticket.id.charCodeAt(1);
  const grid = generateQrGrid(seed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-6 shadow-xl max-w-xs w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1B3A28] dark:text-white">{ticket.eventName}</h3>
          <button onClick={onClose} className="text-[#7A9A80] hover:text-[#1B3A28] dark:hover:text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 21 21" className="w-48 h-48">
            {grid.map((row, r) =>
              row.map((cell, c) =>
                cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#1B3A28" /> : null
              )
            )}
          </svg>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#7A9A80]">{ticket.seatLabels.join(", ")} &middot; {ticket.date}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-1 font-mono">{ticket.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
