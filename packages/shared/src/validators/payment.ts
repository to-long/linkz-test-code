import { z } from "zod";

export const createPaymentSchema = z.object({
  seatIds: z
    .array(z.string().uuid("Invalid seat ID"))
    .min(1, "At least one seat is required")
    .max(4, "Maximum 4 seats per transaction"),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
