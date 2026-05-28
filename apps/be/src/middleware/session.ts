import { createMiddleware } from "hono/factory";
import { clerk } from "../auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

type SessionEnv = {
  Variables: {
    user: SessionUser;
  };
};

export const requireSession = createMiddleware<SessionEnv>(async (c, next) => {
  try {
    const requestState = await clerk.authenticateRequest(c.req.raw, {
      authorizedParties: [
        process.env.FRONTEND_URL || "http://localhost:3031",
        "http://192.168.1.151:3031",
      ],
    });

    if (!requestState.isSignedIn) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { userId } = requestState.toAuth();
    const user = await clerk.users.getUser(userId);

    c.set("user", {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
    });

    await next();
  } catch (err: any) {
    console.error("Auth error:", err.message);
    return c.json({ error: "Unauthorized" }, 401);
  }
});
