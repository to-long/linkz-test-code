import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { seats } from "./schema/seats";
import { payments } from "./schema/payments";
import { reservations } from "./schema/reservations";
import { sql, eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const SEED_SEATS: { label: string; price: number; status: "available" | "reserved" }[] = [
  { label: "A1", price: 1500, status: "available" },
  { label: "A2", price: 1500, status: "available" },
  { label: "A3", price: 1500, status: "available" },
  { label: "A4", price: 1500, status: "available" },
  { label: "B1", price: 2000, status: "available" },
  { label: "B2", price: 2000, status: "available" },
  { label: "B3", price: 2000, status: "available" },
  { label: "B4", price: 2000, status: "available" },
  { label: "C1", price: 2000, status: "available" },
  { label: "C2", price: 2000, status: "available" },
  { label: "C3", price: 2000, status: "available" },
  { label: "C4", price: 2000, status: "available" },
  { label: "D1", price: 2500, status: "available" },
  { label: "D2", price: 2500, status: "available" },
  { label: "D3", price: 2500, status: "available" },
  { label: "D4", price: 2500, status: "available" },
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

  // Users are managed by Clerk — no need to seed test users locally.
  // Sign up via the UI or Clerk dashboard.
  console.log("Users are managed by Clerk. Sign up at the UI or Clerk dashboard.");

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
