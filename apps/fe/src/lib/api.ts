const BASE = "/api";

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    ...options,
  });

  const text = await res.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      res.ok ? "Invalid response from server" : `Server error (${res.status})`
    );
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  getSeats: () => request<{ seats: any[] }>("/seats"),

  holdSeat: (seatId: string) =>
    request<{ seat: any }>(`/seats/${seatId}/hold`, { method: "POST" }),

  releaseSeat: (seatId: string) =>
    request<{ seat: any }>(`/seats/${seatId}/release`, { method: "POST" }),

  createPayment: (seatIds: string[]) =>
    request<{ checkoutUrl: string; payment: any }>("/payments", {
      method: "POST",
      body: JSON.stringify({ seatIds }),
    }),

  getPaymentStatus: (sessionId: string) =>
    request<{ payment: any; reservation: any }>(
      `/payments/status?session_id=${sessionId}`
    ),

  getMyTickets: () =>
    request<{ tickets: any[] }>("/tickets"),
};
