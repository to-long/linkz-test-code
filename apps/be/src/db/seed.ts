import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { seats } from "./schema/seats";
import { payments } from "./schema/payments";
import { reservations } from "./schema/reservations";
import { user as userTable } from "./schema/auth";
import { sql, eq } from "drizzle-orm";
import { auth } from "../auth";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const SEED_SEATS: { label: string; price: number; status: "available" | "reserved" }[] = [
  { label: "A1", price: 1500, status: "reserved" },
  { label: "A2", price: 1500, status: "reserved" },
  { label: "A3", price: 1500, status: "reserved" },
  { label: "A4", price: 1500, status: "reserved" },
  { label: "B1", price: 2000, status: "available" },
  { label: "B2", price: 2000, status: "reserved" },
  { label: "B3", price: 2000, status: "reserved" },
  { label: "B4", price: 2000, status: "reserved" },
  { label: "C1", price: 2000, status: "reserved" },
  { label: "C2", price: 2000, status: "reserved" },
  { label: "C3", price: 2000, status: "reserved" },
  { label: "C4", price: 2000, status: "available" },
  { label: "D1", price: 2500, status: "reserved" },
  { label: "D2", price: 2500, status: "reserved" },
  { label: "D3", price: 2500, status: "available" },
  { label: "D4", price: 2500, status: "reserved" },
];

const TEST_USER = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

async function main() {
  // Clear old seats and related data
  console.log("Clearing old data...");
  await db.execute(sql`DELETE FROM reservations`);
  await db.execute(sql`DELETE FROM payments`);
  await db.execute(sql`DELETE FROM seats`);

  // Seed seats
  console.log("Seeding seats...");
  for (const seat of SEED_SEATS) {
    await db
      .insert(seats)
      .values({ label: seat.label, price: seat.price, status: seat.status })
      .onConflictDoUpdate({
        target: seats.label,
        set: { price: sql`excluded.price`, status: sql`excluded.status` },
      });
  }
  console.log(`Seeded ${SEED_SEATS.length} seats.`);

  // Seed test user via better-auth API
  console.log("Seeding test user...");
  const [existing] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, TEST_USER.email));

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });
    console.log(`Created test user: ${TEST_USER.email} / ${TEST_USER.password}`);
  } else {
    console.log(`Test user already exists: ${TEST_USER.email}`);
  }

  // Seed past tickets for all existing users (each user gets unique reserved seats)
  const allUsers = await db.select().from(userTable);
  const reservedLabels = SEED_SEATS.filter((s) => s.status === "reserved").map((s) => s.label);

  if (allUsers.length > 0) {
    console.log(`Seeding past tickets for ${allUsers.length} user(s)...`);
    const pastDate = new Date("2026-04-20T19:30:00Z");
    let seatIdx = 0;

    for (const u of allUsers) {
      const userSeats = reservedLabels.slice(seatIdx, seatIdx + 2);
      seatIdx += 2;
      if (userSeats.length === 0) break;

      for (const label of userSeats) {
        const [seat] = await db.select().from(seats).where(eq(seats.label, label));
        if (!seat) continue;

        const [payment] = await db
          .insert(payments)
          .values({
            userId: u.id,
            amount: seat.price,
            seatIds: JSON.stringify([seat.id]),
            status: "completed",
            createdAt: pastDate,
            expiresAt: pastDate,
          })
          .returning();

        await db.insert(reservations).values({
          seatId: seat.id,
          userId: u.id,
          paymentId: payment.id,
          createdAt: pastDate,
        });
      }
      console.log(`  → ${userSeats.length} past tickets for ${u.email}`);
    }
  }

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
