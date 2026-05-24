import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import type { Seat } from "./types";

export function useSeats() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSeats = useCallback(async () => {
    try {
      const data = await api.getSeats();
      setSeats(data.seats);
    } catch {
      setError("Failed to load seats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "seats_updated") fetchSeats();
      } catch {}
    };
    ws.onclose = () => {
      // fallback polling if WS disconnects
      const interval = setInterval(fetchSeats, 5000);
      return () => clearInterval(interval);
    };

    return () => ws.close();
  }, [fetchSeats]);

  return { seats, loading, error, fetchSeats };
}
