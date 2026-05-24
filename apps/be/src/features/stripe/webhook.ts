import { Hono } from "hono";
import { stripe } from "../../lib/stripe";
import { handleStripeWebhook } from "../payments/service";

const app = new Hono().post("/webhook", async (c) => {
  const signature = c.req.header("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return c.json({ error: "Missing stripe-signature header" }, 400);
  }

  const rawBody = await c.req.text();

  let event;

  if (webhookSecret) {
    // Production: verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return c.json({ error: "Invalid signature" }, 400);
    }
  } else {
    // Development: skip signature verification (for Stripe CLI forwarding)
    console.warn("⚠️  STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
    event = JSON.parse(rawBody);
  }

  try {
    await handleStripeWebhook(event);
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    // Still return 200 to prevent Stripe from retrying
    // Log the error for investigation
  }

  return c.json({ received: true });
});

export default app;
