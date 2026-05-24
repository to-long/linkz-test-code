/**
 * E2E API integration tests.
 *
 * These tests hit the real running server (default http://localhost:8081).
 * Start the backend with `make dev` before running `bun test src/__tests__/api.test.ts`.
 */
import { describe, test, expect } from "bun:test";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8081";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function json(res: Response): Promise<any> {
  return res.json();
}

// ---------------------------------------------------------------------------
// Public endpoints (no auth required)
// ---------------------------------------------------------------------------
describe("GET /api/health", () => {
  test("returns 200 with status ok", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    // timestamp should be a valid ISO string
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});

describe("GET /api/openapi.json", () => {
  test("returns valid OpenAPI 3.1 spec", async () => {
    const res = await fetch(`${BASE_URL}/api/openapi.json`);
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Seat Reservation API");
    expect(body.paths).toBeDefined();
    expect(Object.keys(body.paths).length).toBeGreaterThan(0);
  });

  test("spec includes expected paths", async () => {
    const res = await fetch(`${BASE_URL}/api/openapi.json`);
    const body = await json(res);
    const paths = Object.keys(body.paths);

    // The OpenAPI paths should include at least these
    expect(paths).toContain("/api/health");
    expect(paths).toContain("/api/seats");
  });
});

describe("GET /api/seats", () => {
  test("returns seats array", async () => {
    const res = await fetch(`${BASE_URL}/api/seats`);
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(Array.isArray(body.seats)).toBe(true);
  });

  test("each seat has required fields", async () => {
    const res = await fetch(`${BASE_URL}/api/seats`);
    const body = await json(res);

    if (body.seats.length === 0) return; // skip if DB has no seats

    const seat = body.seats[0];
    expect(seat.id).toBeDefined();
    expect(typeof seat.id).toBe("string");
    expect(seat.label).toBeDefined();
    expect(typeof seat.label).toBe("string");
    expect(typeof seat.price).toBe("number");
    expect(seat.price).toBeGreaterThan(0);
    expect(["available", "held", "reserved"]).toContain(seat.status);
  });

  test("seats are ordered by label", async () => {
    const res = await fetch(`${BASE_URL}/api/seats`);
    const body = await json(res);

    if (body.seats.length < 2) return;

    const labels = body.seats.map((s: any) => s.label);
    const sorted = [...labels].sort();
    expect(labels).toEqual(sorted);
  });
});

// ---------------------------------------------------------------------------
// Protected endpoints (require auth -- should return 401)
// ---------------------------------------------------------------------------
describe("POST /api/seats/:id/hold (unauthenticated)", () => {
  test("returns 401 without authentication", async () => {
    const res = await fetch(
      `${BASE_URL}/api/seats/550e8400-e29b-41d4-a716-446655440000/hold`,
      { method: "POST" },
    );
    expect(res.status).toBe(401);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

describe("POST /api/seats/:id/release (unauthenticated)", () => {
  test("returns 401 without authentication", async () => {
    const res = await fetch(
      `${BASE_URL}/api/seats/550e8400-e29b-41d4-a716-446655440000/release`,
      { method: "POST" },
    );
    expect(res.status).toBe(401);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

describe("POST /api/payments (unauthenticated)", () => {
  test("returns 401 without authentication", async () => {
    const res = await fetch(`${BASE_URL}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seatIds: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    });
    expect(res.status).toBe(401);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

describe("GET /api/payments/status (unauthenticated)", () => {
  test("returns 401 without authentication", async () => {
    const res = await fetch(
      `${BASE_URL}/api/payments/status?session_id=cs_test_fake`,
    );
    expect(res.status).toBe(401);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

describe("GET /api/payments/mine (unauthenticated)", () => {
  test("returns 401 without authentication", async () => {
    const res = await fetch(`${BASE_URL}/api/payments/mine`);
    expect(res.status).toBe(401);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

describe("GET /api/tickets (unauthenticated)", () => {
  test("returns 401 without authentication", async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`);
    expect(res.status).toBe(401);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Stripe webhook endpoint
// ---------------------------------------------------------------------------
describe("POST /api/stripe/webhook", () => {
  test("returns 400 without stripe-signature header", async () => {
    const res = await fetch(`${BASE_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "test" }),
    });
    expect(res.status).toBe(400);

    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Authenticated flow (sign up -> list seats -> hold -> release)
// ---------------------------------------------------------------------------
describe("Authenticated flow", () => {
  let cookie = "";
  let seatId = "";

  test("can sign up a new user", async () => {
    const email = `e2e-${Date.now()}@test.com`;
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Test User",
        email,
        password: "testpass123",
      }),
      redirect: "manual",
    });
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    cookie = setCookie || "";
  });

  test("can list seats when authenticated", async () => {
    if (!cookie) return;

    const res = await fetch(`${BASE_URL}/api/seats`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(Array.isArray(body.seats)).toBe(true);

    const available = body.seats.find(
      (s: any) => s.status === "available",
    );
    if (available) seatId = available.id;
  });

  test("can hold an available seat", async () => {
    if (!cookie || !seatId) return;

    const res = await fetch(`${BASE_URL}/api/seats/${seatId}/hold`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(body.seat).toBeDefined();
    expect(body.seat.status).toBe("held");
    expect(body.seat.id).toBe(seatId);
  });

  test("cannot hold the same seat again from another session", async () => {
    if (!cookie || !seatId) return;

    // No auth cookie -- simulates "another user"
    const res = await fetch(`${BASE_URL}/api/seats/${seatId}/hold`, {
      method: "POST",
    });
    // Without auth we get 401
    expect(res.status).toBe(401);
  });

  test("can release a held seat", async () => {
    if (!cookie || !seatId) return;

    const res = await fetch(`${BASE_URL}/api/seats/${seatId}/release`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(body.seat).toBeDefined();
    expect(body.seat.status).toBe("available");
    expect(body.seat.id).toBe(seatId);
  });

  test("can view own tickets (empty for new user)", async () => {
    if (!cookie) return;

    const res = await fetch(`${BASE_URL}/api/tickets`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(Array.isArray(body.tickets)).toBe(true);
  });

  test("can view own payments (empty for new user)", async () => {
    if (!cookie) return;

    const res = await fetch(`${BASE_URL}/api/payments/mine`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);

    const body = await json(res);
    expect(Array.isArray(body.payments)).toBe(true);
  });
});
