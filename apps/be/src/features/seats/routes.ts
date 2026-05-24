import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../middleware/session";
import { listSeats, holdSeat, releaseSeat } from "./service";

const SeatSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  price: z.number(),
  status: z.enum(["available", "held", "reserved"]),
  heldBy: z.string().nullable().optional(),
  heldUntil: z.string().nullable().optional(),
  reservedBy: z.string().nullable().optional(),
});

const ErrorSchema = z.object({
  error: z.string(),
});

const app = new OpenAPIHono();

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Seats"],
  responses: {
    200: {
      description: "List all seats",
      content: {
        "application/json": {
          schema: z.object({ seats: z.array(SeatSchema) }),
        },
      },
    },
  },
});

app.openapi(listRoute, async (c) => {
  const allSeats = await listSeats();
  return c.json({ seats: allSeats });
});

const holdRoute = createRoute({
  method: "post",
  path: "/{id}/hold",
  tags: ["Seats"],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  middleware: [requireSession] as const,
  security: [{ session: [] }],
  responses: {
    200: {
      description: "Seat held successfully",
      content: {
        "application/json": { schema: z.object({ seat: SeatSchema }) },
      },
    },
    409: {
      description: "Seat not available",
      content: {
        "application/json": { schema: ErrorSchema },
      },
    },
  },
});

app.openapi(holdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  const result = await holdSeat(id, user.id);

  if ("error" in result) {
    return c.json({ error: result.error }, 409);
  }

  return c.json({ seat: result.seat });
});

const releaseRoute = createRoute({
  method: "post",
  path: "/{id}/release",
  tags: ["Seats"],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  middleware: [requireSession] as const,
  security: [{ session: [] }],
  responses: {
    200: {
      description: "Seat released successfully",
      content: {
        "application/json": { schema: z.object({ seat: SeatSchema }) },
      },
    },
    400: {
      description: "Cannot release seat",
      content: {
        "application/json": { schema: ErrorSchema },
      },
    },
  },
});

app.openapi(releaseRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");
  const released = await releaseSeat(id, user.id);

  if (!released) {
    return c.json({ error: "Cannot release this seat" }, 400);
  }

  return c.json({ seat: released });
});

export default app;
