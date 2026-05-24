import type { ServerWebSocket } from "bun";

const clients = new Set<ServerWebSocket<unknown>>();

export function addClient(ws: ServerWebSocket<unknown>) {
  clients.add(ws);
}

export function removeClient(ws: ServerWebSocket<unknown>) {
  clients.delete(ws);
}

export function broadcastSeatsUpdate() {
  const msg = JSON.stringify({ type: "seats_updated" });
  for (const ws of clients) {
    ws.send(msg);
  }
}
