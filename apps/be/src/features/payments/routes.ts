import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../middleware/session";
import { createPaymentSchema } from "@seat-reservation/shared";
import {
  createCheckoutSession,
  getPaymentByStripeSession,
  getUserPayments,
} from "./service";

const PaymentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number(),
  seatIds: z.string(),
  status: z.enum(["pending", "completed", "failed", "expired"]),
  createdAt: z.string(),
  expiresAt: z.string(),
});

const ReservationSchema = z.object({
  id: z.string().uuid(),
  seatId: z.string().uuid(),
  userId: z.string(),
  paymentId: z.string().uuid(),
  createdAt: z.string(),
  seatLabels: z.array(z.string()).optional(),
});

const ErrorSchema = z.object({
  error: z.string(),
});

const app = new OpenAPIHono();

const createPaymentRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Payments"],
  request: {
    body: {
      content: {
        "application/json": { schema: createPaymentSchema },
      },
    },
  },
  middleware: [requireSession] as const,
  security: [{ session: [] }],
  responses: {
    201: {
      description: "Checkout session created",
      content: {
        "application/json": {
          schema: z.object({
            checkoutUrl: z.string().url(),
            payment: PaymentSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid request",
      content: { "application/json": { schema: ErrorSchema } },
    },
    503: {
      description: "Payment service unavailable",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

app.openapi(createPaymentRoute, async (c) => {
  const { seatIds } = c.req.valid("json");
  const user = c.get("user");

  try {
    const result = await createCheckoutSession(seatIds, user.id);

    if ("error" in result) {
      return c.json({ error: result.error }, 400);
    }

    return c.json(
      { checkoutUrl: result.checkoutUrl, payment: result.payment },
      201,
    );
  } catch (err: any) {
    console.error(
      "Payment creation failed:",
      err.message,
      err.type,
      err.code,
    );
    return c.json(
      {
        error: "Payment service unavailable. Please try again later.",
      },
      503,
    );
  }
});

const paymentStatusRoute = createRoute({
  method: "get",
  path: "/status",
  tags: ["Payments"],
  request: {
    query: z.object({
      session_id: z.string().openapi({ description: "Stripe session ID" }),
    }),
  },
  middleware: [requireSession] as const,
  security: [{ session: [] }],
  responses: {
    200: {
      description: "Payment status",
      content: {
        "application/json": {
          schema: z.object({
            payment: PaymentSchema,
            reservation: ReservationSchema.optional(),
          }),
        },
      },
    },
    400: {
      description: "Missing session_id",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Payment not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

app.openapi(paymentStatusRoute, async (c) => {
  const { session_id: sessionId } = c.req.valid("query");
  const user = c.get("user");
  const result = await getPaymentByStripeSession(sessionId, user.id);

  if ("error" in result) {
    return c.json({ error: result.error }, 404);
  }

  return c.json({
    payment: result.payment,
    reservation: result.reservation,
  });
});

const myPaymentsRoute = createRoute({
  method: "get",
  path: "/mine",
  tags: ["Payments"],
  middleware: [requireSession] as const,
  security: [{ session: [] }],
  responses: {
    200: {
      description: "User payments",
      content: {
        "application/json": {
          schema: z.object({ payments: z.array(PaymentSchema) }),
        },
      },
    },
  },
});

app.openapi(myPaymentsRoute, async (c) => {
  const user = c.get("user");
  const userPayments = await getUserPayments(user.id);
  return c.json({ payments: userPayments });
});

export default app;
