import { eq, and, inArray } from "drizzle-orm";
import { db, payments, seats, reservations } from "../../db";
import { stripe } from "../../lib/stripe";
import { reserveSeat } from "../seats/service";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3031";

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Shared helper: marks a payment as completed and reserves all associated seats.
 * Must be called within a transaction.
 */
async function completePaymentAndReserveSeats(
  tx: TransactionClient,
  paymentId: string,
  paymentIntentId: string,
  seatIds: string[],
  userId: string,
): Promise<boolean> {
  const [updated] = await tx
    .update(payments)
    .set({
      status: "completed",
      stripePaymentIntentId: paymentIntentId,
    })
    .where(
      and(
        eq(payments.id, paymentId),
        eq(payments.status, "pending"), // optimistic concurrency
      ),
    )
    .returning();

  if (!updated) {
    return false;
  }

  for (const seatId of seatIds) {
    const reserved = await reserveSeat(seatId, userId);
    if (!reserved) {
      console.error(
        `Seat ${seatId} reservation failed after payment ${paymentId}`,
      );
      continue;
    }

    await tx.insert(reservations).values({
      seatId,
      userId,
      paymentId,
    });
  }

  return true;
}

export async function createCheckoutSession(seatIds: string[], userId: string) {
  // Fetch all requested seats
  const seatRows = await db
    .select()
    .from(seats)
    .where(inArray(seats.id, seatIds));

  if (seatRows.length !== seatIds.length) {
    return { error: "One or more seats not found" as const };
  }

  // Verify all seats are held by the user
  for (const seat of seatRows) {
    if (seat.status !== "held" || seat.heldBy !== userId) {
      return { error: `Seat ${seat.label} is not held by you` as const };
    }
  }

  const totalAmount = seatRows.reduce((sum, s) => sum + s.price, 0);

  // Stripe requires minimum 30 minutes for Checkout Session expiry
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // Create internal payment record
  const [payment] = await db
    .insert(payments)
    .values({
      userId,
      amount: totalAmount,
      seatIds: JSON.stringify(seatIds),
      status: "pending",
      expiresAt,
    })
    .returning();

  // Create Stripe Checkout Session with multiple line items
  const lineItems = seatRows.map((seat) => ({
    price_data: {
      currency: "usd",
      unit_amount: seat.price, // already in cents
      product_data: {
        name: seat.label,
        description: `Reservation for ${seat.label}`,
      },
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    metadata: {
      paymentId: payment.id,
      seatIds: JSON.stringify(seatIds),
      userId,
    },
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/payment/cancel`,
  });

  // Store Stripe session ID in our payment record
  await db
    .update(payments)
    .set({ stripeSessionId: session.id })
    .where(eq(payments.id, payment.id));

  return { checkoutUrl: session.url, payment };
}

export async function handleStripeWebhook(event: any) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { paymentId, seatIds: seatIdsJson, userId } = session.metadata;

    if (!paymentId || !seatIdsJson || !userId) {
      console.error("Webhook missing metadata:", session.metadata);
      return;
    }

    const seatIds: string[] = JSON.parse(seatIdsJson);
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      console.error("Invalid seatIds in metadata:", seatIdsJson);
      return;
    }

    await db.transaction(async (tx) => {
      const success = await completePaymentAndReserveSeats(
        tx,
        paymentId,
        session.payment_intent,
        seatIds,
        userId,
      );

      if (!success) {
        console.error(`Payment ${paymentId} already processed or not found`);
        return;
      }

      console.log(
        `✓ Reservation completed: seats=${seatIds.join(",")}, payment=${paymentId}`,
      );
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const { paymentId } = session.metadata || {};

    if (paymentId) {
      await db
        .update(payments)
        .set({ status: "expired" })
        .where(eq(payments.id, paymentId));
      console.log(`Payment ${paymentId} expired (Stripe session timeout)`);
    }
  }
}

export async function getPaymentStatus(paymentId: string, userId: string) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)));

  if (!payment) {
    return { error: "Payment not found" as const };
  }

  const reservationRows = await getReservationsWithSeats(paymentId);

  return { payment, reservations: reservationRows };
}

async function getReservationsWithSeats(paymentId: string) {
  return db
    .select({
      id: reservations.id,
      seatId: reservations.seatId,
      userId: reservations.userId,
      paymentId: reservations.paymentId,
      createdAt: reservations.createdAt,
      seatLabel: seats.label,
    })
    .from(reservations)
    .innerJoin(seats, eq(reservations.seatId, seats.id))
    .where(eq(reservations.paymentId, paymentId));
}

export async function getPaymentByStripeSession(
  sessionId: string,
  userId: string,
) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(
      and(eq(payments.stripeSessionId, sessionId), eq(payments.userId, userId)),
    );

  if (!payment) {
    return { error: "Payment not found" as const };
  }

  // If payment is still pending, verify directly with Stripe (webhook fallback)
  if (payment.status === "pending") {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        console.log(
          `Fallback: verifying payment ${payment.id} via Stripe API`,
        );

        await db.transaction(async (tx) => {
          const seatIds: string[] = JSON.parse(payment.seatIds);

          await completePaymentAndReserveSeats(
            tx,
            payment.id,
            session.payment_intent as string,
            seatIds,
            payment.userId,
          );
        });

        console.log(
          `✓ Fallback reservation completed: payment=${payment.id}`,
        );

        // Re-fetch updated data
        const [freshPayment] = await db
          .select()
          .from(payments)
          .where(eq(payments.id, payment.id));
        const reservationRows = await getReservationsWithSeats(payment.id);

        return {
          payment: freshPayment,
          reservation: {
            seatLabels: reservationRows.map((r) => r.seatLabel),
            ...reservationRows[0],
          },
        };
      }
    } catch (err: any) {
      console.error("Stripe session verification failed:", err.message);
    }
  }

  const reservationRows = await getReservationsWithSeats(payment.id);
  const reservation =
    reservationRows.length > 0
      ? {
          seatLabels: reservationRows.map((r) => r.seatLabel),
          ...reservationRows[0],
        }
      : null;

  return { payment, reservation };
}

export async function getUserPayments(userId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);
}
