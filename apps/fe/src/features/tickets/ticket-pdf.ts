import type { Ticket } from "./types";
import { generateQrGrid } from "./qr-modal";

export function downloadTicketPdf(ticket: Ticket) {
  const canvas = document.createElement("canvas");
  const w = 800, h = 400;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 16);
  ctx.fill();

  // Left stub
  const stubW = 140;
  ctx.fillStyle = ticket.status === "upcoming" ? "#2D5E3A" : "#9CA3AF";
  ctx.beginPath();
  ctx.roundRect(0, 0, stubW, h, [16, 0, 0, 16]);
  ctx.fill();

  // Stub text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "2px";
  ctx.fillText(ticket.status === "upcoming" ? "VALID" : "USED", stubW / 2, h / 2 + 30);

  // Stub ticket icon (simple)
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;
  const ix = stubW / 2, iy = h / 2 - 15;
  ctx.beginPath();
  ctx.roundRect(ix - 20, iy - 14, 40, 28, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ix, iy - 14); ctx.lineTo(ix, iy - 8);
  ctx.moveTo(ix, iy - 2); ctx.lineTo(ix, iy + 4);
  ctx.moveTo(ix, iy + 8); ctx.lineTo(ix, iy + 14);
  ctx.stroke();

  // Dashed divider
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "#D6DDD0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(stubW, 20);
  ctx.lineTo(stubW, h - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Content area
  const cx = stubW + 36;
  let cy = 50;

  // Event name
  ctx.fillStyle = "#1B3A28";
  ctx.font = "bold 22px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(ticket.eventName, cx, cy);
  cy += 32;

  // Ref
  ctx.fillStyle = "#7A9A80";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText(`Ref: ${ticket.id.slice(0, 8).toUpperCase()}`, cx, cy);
  cy += 36;

  // Info row
  ctx.fillStyle = "#1B3A28";
  ctx.font = "500 14px Inter, sans-serif";
  ctx.fillText(`Date: ${ticket.date}`, cx, cy);
  ctx.fillText(`Time: ${ticket.time}`, cx + 180, cy);
  cy += 24;
  ctx.fillText(`Seats: ${ticket.seatLabels.join(", ")}`, cx, cy);

  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(ticket.totalAmount / 100);
  ctx.fillText(`Total: ${price}`, cx + 180, cy);
  cy += 36;

  // Divider
  ctx.strokeStyle = "#E8F0ED";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(w - 36, cy);
  ctx.stroke();
  cy += 24;

  // QR code
  const seed = ticket.id.charCodeAt(0) + ticket.id.charCodeAt(1);
  const grid = generateQrGrid(seed);
  const qrSize = 100;
  const cellSize = qrSize / 21;
  const qrX = w - 36 - qrSize;
  const qrY = cy - 10;
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = "#1B3A28";
        ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize);
      }
    })
  );

  // Status badge next to QR
  ctx.fillStyle = ticket.status === "upcoming" ? "#E8F0ED" : "#F5F3EE";
  ctx.beginPath();
  ctx.roundRect(cx, cy, 100, 28, 14);
  ctx.fill();
  ctx.fillStyle = ticket.status === "upcoming" ? "#2D5E3A" : "#7A9A80";
  ctx.beginPath();
  ctx.arc(cx + 16, cy + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "bold 12px Inter, sans-serif";
  ctx.fillText(ticket.status === "upcoming" ? "Upcoming" : "Past", cx + 28, cy + 18);

  // Download
  const link = document.createElement("a");
  link.download = `ticket-${ticket.seatLabels.join("-")}-${ticket.date}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
