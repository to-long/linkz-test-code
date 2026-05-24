import { describe, test, expect, beforeEach, mock } from "bun:test";
import { api } from "../lib/api";

// Mock fetch
const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify({ seats: [] })),
  } as Response)
);

globalThis.fetch = mockFetch as any;

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getSeats", () => {
    test("calls GET /api/seats", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ seats: [{ id: "1", label: "A1" }] })
          ),
      } as any);

      const result = await api.getSeats();
      expect(result.seats).toHaveLength(1);
      expect(result.seats[0].label).toBe("A1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/seats",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });
  });

  describe("holdSeat", () => {
    test("calls POST /api/seats/:id/hold", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ seat: { id: "1", status: "held" } })
          ),
      } as any);

      const result = await api.holdSeat("seat-123");
      expect(result.seat.status).toBe("held");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/seats/seat-123/hold",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("releaseSeat", () => {
    test("calls POST /api/seats/:id/release", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ seat: { id: "1", status: "available" } })
          ),
      } as any);

      const result = await api.releaseSeat("seat-123");
      expect(result.seat.status).toBe("available");
    });
  });

  describe("createPayment", () => {
    test("calls POST /api/payments with seatIds array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              checkoutUrl: "https://checkout.stripe.com/test",
              payment: {},
            })
          ),
      } as any);

      const result = await api.createPayment(["seat-123", "seat-456"]);
      expect(result.checkoutUrl).toContain("stripe.com");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/payments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ seatIds: ["seat-123", "seat-456"] }),
        })
      );
    });
  });

  describe("getPaymentStatus", () => {
    test("calls GET /api/payments/status with session_id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              payment: { id: "pay-1", status: "completed" },
              reservation: { id: "res-1" },
            })
          ),
      } as any);

      const result = await api.getPaymentStatus("cs_test_123");
      expect(result.payment.status).toBe("completed");
      expect(result.reservation.id).toBe("res-1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/payments/status?session_id=cs_test_123",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });
  });

  describe("getMyTickets", () => {
    test("calls GET /api/tickets", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              tickets: [
                { id: "t-1", seatLabel: "A1" },
                { id: "t-2", seatLabel: "B2" },
              ],
            })
          ),
      } as any);

      const result = await api.getMyTickets();
      expect(result.tickets).toHaveLength(2);
      expect(result.tickets[0].seatLabel).toBe("A1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/tickets",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });
  });

  describe("error handling", () => {
    test("throws on non-ok response with JSON error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: () =>
          Promise.resolve(JSON.stringify({ error: "Seat already held" })),
      } as any);

      expect(api.holdSeat("seat-123")).rejects.toThrow("Seat already held");
    });

    test("throws on invalid JSON response when ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("not json"),
      } as any);

      expect(api.getSeats()).rejects.toThrow("Invalid response from server");
    });

    test("throws generic error on non-ok with invalid JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("server error"),
      } as any);

      expect(api.getSeats()).rejects.toThrow("Server error (500)");
    });

    test("throws fallback message when JSON error field is missing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ message: "bad request" })),
      } as any);

      expect(api.getSeats()).rejects.toThrow("Request failed: 400");
    });
  });
});
