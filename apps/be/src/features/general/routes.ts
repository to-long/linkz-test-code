import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["General"],
  responses: {
    200: {
      description: "Health check",
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("ok"),
            timestamp: z.string().datetime(),
          }),
        },
      },
    },
  },
});

app.openapi(healthRoute, (c) => {
  return c.json({ status: "ok" as const, timestamp: new Date().toISOString() });
});

export default app;
