import { eq } from "drizzle-orm";
import { db, reservations, seats, payments } from "../../db";

export async function getUserTickets(userId: string) {
  const rows = await db
    .select({
      reservationId: reservations.id,
      seatLabel: seats.label,
      totalAmount: payments.amount,
      paymentStatus: payments.status,
      createdAt: reservations.createdAt,
    })
    .from(reservations)
    .innerJoin(seats, eq(reservations.seatId, seats.id))
    .innerJoin(payments, eq(reservations.paymentId, payments.id))
    .where(eq(reservations.userId, userId));

  return rows.map((r) => {
    const eventDate = new Date(r.createdAt);
    eventDate.setDate(eventDate.getDate() + 1);
    const isPast = eventDate < new Date();
    return {
      id: r.reservationId,
      seatLabels: [r.seatLabel],
      eventName: "Cinema Hall A",
      date: eventDate.toISOString().split("T")[0],
      time: "7:30 PM",
      totalAmount: r.totalAmount,
      status: isPast ? ("past" as const) : ("upcoming" as const),
    };
  });
}
