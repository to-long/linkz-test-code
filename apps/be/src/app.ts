import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import seatRoutes from "./features/seats/routes";
import paymentRoutes from "./features/payments/routes";
import generalRoutes from "./features/general/routes";
import stripeWebhook from "./features/stripe/webhook";
import ticketRoutes from "./features/tickets/routes";

const app = new OpenAPIHono();

// Stripe webhook must be registered BEFORE global CORS/JSON middleware
// because it needs the raw request body for signature verification
app.route("/api/stripe", stripeWebhook);

app.use(
  "*",
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3031",
      "http://192.168.1.151:3031",
    ],
    credentials: true,
  }),
);

app.use("*", logger());

// better-auth handles its own routing under /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api", generalRoutes);
app.route("/api/seats", seatRoutes);
app.route("/api/payments", paymentRoutes);
app.route("/api/tickets", ticketRoutes);

app.doc("/api/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Seat Reservation API",
    version: "1.0.0",
    description:
      "API for cinema seat reservation with Stripe payment integration",
  },
  servers: [{ url: "http://localhost:8081", description: "Local dev" }],
  security: [{ session: [] }],
});

app.openAPIRegistry.registerComponent("securitySchemes", "session", {
  type: "apiKey",
  in: "cookie",
  name: "better-auth.session_token",
});

app.get(
  "/api/reference",
  apiReference({
    spec: { url: "/api/openapi.json" },
    theme: "kepler",
  }),
);

export default app;
