import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export function usePaymentStatus(sessionId: string | null) {
  const [status, setStatus] = useState<"loading" | "success" | "pending">("loading");
  const [reservation, setReservation] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    async function checkStatus() {
      try {
        const data = await api.getPaymentStatus(sessionId!);
        if (data.payment.status === "completed" && data.reservation) {
          setStatus("success");
          setReservation(data.reservation);
          setPayment(data.payment);
        } else {
          setStatus("pending");
          if (retryCount < 10) {
            setTimeout(() => setRetryCount((c) => c + 1), 2000);
          }
        }
      } catch {
        if (retryCount < 10) {
          setTimeout(() => setRetryCount((c) => c + 1), 2000);
        }
      }
    }

    checkStatus();
  }, [sessionId, retryCount]);

  return { status, reservation, payment };
}
