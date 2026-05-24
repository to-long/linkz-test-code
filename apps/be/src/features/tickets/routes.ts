import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireSession } from "../../middleware/session";
import { getUserTickets } from "./service";

const TicketSchema = z.object({
  id: z.string().uuid(),
  seatLabels: z.array(z.string()),
  eventName: z.string(),
  date: z.string(),
  time: z.string(),
  totalAmount: z.number(),
  status: z.enum(["past", "upcoming"]),
});

const app = new OpenAPIHono();

const listTicketsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tickets"],
  middleware: [requireSession] as const,
  security: [{ session: [] }],
  responses: {
    200: {
      description: "User tickets",
      content: {
        "application/json": {
          schema: z.object({ tickets: z.array(TicketSchema) }),
        },
      },
    },
  },
});

app.openapi(listTicketsRoute, async (c) => {
  const user = c.get("user");
  const tickets = await getUserTickets(user.id);
  return c.json({ tickets });
});

export default app;
