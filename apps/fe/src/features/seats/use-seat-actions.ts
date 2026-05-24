import { useState } from "react";
import { api } from "../../lib/api";

export function useSeatActions(fetchSeats: () => Promise<void>) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleHold(seatId: string) {
    setActionError("");
    setActionLoading(seatId);
    try {
      await api.holdSeat(seatId);
      await fetchSeats();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRelease(seatId: string) {
    setActionError("");
    setActionLoading(seatId);
    try {
      await api.releaseSeat(seatId);
      await fetchSeats();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return { handleHold, handleRelease, actionLoading, actionError, setActionError };
}
