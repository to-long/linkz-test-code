import { eq, and } from "drizzle-orm";
import { db, seats } from "../db";
import { broadcastSeatsUpdate } from "./ws";

const timers = new Map<string, Timer>();

/**
 * Schedule automatic release of a held seat at its expiry time.
 * If a timer already exists for this seat, it is replaced.
 */
export function scheduleRelease(seatId: string, heldUntil: Date) {
  cancelRelease(seatId);

  const delay = heldUntil.getTime() - Date.now();
  if (delay <= 0) {
    // Already expired — release immediately
    releaseSeat(seatId);
    return;
  }

  const timer = setTimeout(() => {
    timers.delete(seatId);
    releaseSeat(seatId);
  }, delay);

  timers.set(seatId, timer);
}

/**
 * Cancel a scheduled release (e.g., user released manually or seat was reserved).
 */
export function cancelRelease(seatId: string) {
  const existing = timers.get(seatId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(seatId);
  }
}

/**
 * Release a single expired seat and broadcast update via WebSocket.
 */
async function releaseSeat(seatId: string) {
  const [released] = await db
    .update(seats)
    .set({
      status: "available",
      heldBy: null,
      heldUntil: null,
      updatedAt: new Date(),
    })
    .where(and(eq(seats.id, seatId), eq(seats.status, "held")))
    .returning();

  if (released) {
    broadcastSeatsUpdate();
    console.log(`♻️ Hold expired: ${released.label} released`);
  }
}

/**
 * On server startup, reload all active holds from DB and schedule their releases.
 */
export async function restoreHoldTimers() {
  const heldSeats = await db
    .select({ id: seats.id, label: seats.label, heldUntil: seats.heldUntil })
    .from(seats)
    .where(eq(seats.status, "held"));

  let restored = 0;
  for (const seat of heldSeats) {
    if (seat.heldUntil) {
      scheduleRelease(seat.id, seat.heldUntil);
      restored++;
    }
  }

  if (restored > 0) {
    console.log(`🔄 Restored ${restored} hold timer(s) from database`);
  }
}
