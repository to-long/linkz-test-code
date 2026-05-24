import app from "./app";
import { addClient, removeClient } from "./lib/ws";
import { restoreHoldTimers } from "./lib/hold-scheduler";

const port = Number(process.env.PORT) || 8081;

console.log(`Server starting on port ${port}`);

// Restore scheduled hold releases from DB (survives server restarts)
restoreHoldTimers();

export default {
  port,
  fetch(req: Request, server: any) {
    if (new URL(req.url).pathname === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return app.fetch(req, server);
  },
  websocket: {
    open(ws: any) {
      addClient(ws);
    },
    close(ws: any) {
      removeClient(ws);
    },
    message() {},
  },
};
