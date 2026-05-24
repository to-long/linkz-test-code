/**
 * Concurrency tests — verify optimistic locking prevents double-booking.
 *
 * These tests hit the real running server (default http://localhost:8081).
 * Start the backend with `make dev` before running.
 *
 * The tests create multiple users and race them against the same seat
 * to prove that only one succeeds (WHERE status = 'available' guard).
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8081";
const NUM_CONCURRENT_USERS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function signUp(name: string): Promise<string> {
  const email = `concurrency-${name}-${Date.now()}@test.com`;
  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password: "testpass123" }),
    redirect: "manual",
  });
  if (res.status !== 200) throw new Error(`Sign-up failed for ${name}`);
  return res.headers.get("set-cookie") || "";
}

async function holdSeat(
  seatId: string,
  cookie: string,
): Promise<{ status: number; body: any }> {
  const res = await fetch(`${BASE_URL}/api/seats/${seatId}/hold`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function releaseSeat(seatId: string, cookie: string): Promise<void> {
  await fetch(`${BASE_URL}/api/seats/${seatId}/release`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
}

async function getAvailableSeat(
  cookie: string,
): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/seats`, {
    headers: { Cookie: cookie },
  });
  const body = (await res.json()) as any;
  const available = body.seats?.find(
    (s: any) => s.status === "available",
  );
  return available?.id ?? null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Concurrency: optimistic locking", () => {
  const cookies: string[] = [];
  let targetSeatId: string;

  beforeAll(async () => {
    // Create N users in parallel
    const signUps = Array.from({ length: NUM_CONCURRENT_USERS }, (_, i) =>
      signUp(`user-${i}`),
    );
    const results = await Promise.all(signUps);
    cookies.push(...results);

    // Find an available seat to race on
    const seatId = await getAvailableSeat(cookies[0]);
    if (!seatId) throw new Error("No available seat found — run `make seed` first");
    targetSeatId = seatId;
  });

  afterAll(async () => {
    // Release the seat so we don't leave dirty state
    for (const cookie of cookies) {
      await releaseSeat(targetSeatId, cookie).catch(() => {});
    }
  });

  test(`${NUM_CONCURRENT_USERS} users race to hold the same seat — exactly 1 wins`, async () => {
    // Fire all hold requests simultaneously
    const results = await Promise.all(
      cookies.map((cookie) => holdSeat(targetSeatId, cookie)),
    );

    const successes = results.filter((r) => r.status === 200);
    const conflicts = results.filter((r) => r.status === 409);

    // Exactly 1 user should succeed
    expect(successes).toHaveLength(1);
    expect(successes[0].body.seat.status).toBe("held");

    // The rest should get 409 Conflict
    expect(conflicts).toHaveLength(NUM_CONCURRENT_USERS - 1);
    for (const c of conflicts) {
      expect(c.body.error).toBeDefined();
    }
  });

  test("winner's seat shows as held in the seats list", async () => {
    const res = await fetch(`${BASE_URL}/api/seats`, {
      headers: { Cookie: cookies[0] },
    });
    const body = (await res.json()) as any;
    const seat = body.seats.find((s: any) => s.id === targetSeatId);
    expect(seat.status).toBe("held");
  });

  test("second attempt by a different user still fails", async () => {
    // The seat is already held — any other user should get 409
    const loserCookie = cookies[cookies.length - 1];
    const result = await holdSeat(targetSeatId, loserCookie);
    expect(result.status).toBe(409);
  });

  test("winner can release and seat becomes available again", async () => {
    // Find who won
    const results = await Promise.all(
      cookies.map((cookie) => holdSeat(targetSeatId, cookie)),
    );
    // The winner is the one who already holds it (or the original winner)
    // Try releasing with each cookie until one succeeds
    let released = false;
    for (const cookie of cookies) {
      const res = await fetch(`${BASE_URL}/api/seats/${targetSeatId}/release`, {
        method: "POST",
        headers: { Cookie: cookie },
      });
      if (res.status === 200) {
        released = true;
        break;
      }
    }
    expect(released).toBe(true);

    // Verify seat is available again
    const res = await fetch(`${BASE_URL}/api/seats`);
    const body = (await res.json()) as any;
    const seat = body.seats.find((s: any) => s.id === targetSeatId);
    expect(seat.status).toBe("available");
  });

  test("after release, a new race also produces exactly 1 winner", async () => {
    // Race again on the same (now available) seat
    const results = await Promise.all(
      cookies.map((cookie) => holdSeat(targetSeatId, cookie)),
    );

    const successes = results.filter((r) => r.status === 200);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(NUM_CONCURRENT_USERS - 1);
  });
});
