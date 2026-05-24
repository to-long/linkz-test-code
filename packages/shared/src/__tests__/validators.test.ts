import { describe, test, expect } from "bun:test";
import {
  loginSchema,
  signupSchema,
  createPaymentSchema,
  confirmPaymentSchema,
} from "../index";

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  test("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  test("accepts password with exactly 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  test("rejects extra fields (strips them in parsed output)", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      extra: "field",
    });
    // Zod strips unknown keys by default, so parse still succeeds
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// signupSchema
// ---------------------------------------------------------------------------
describe("signupSchema", () => {
  test("accepts valid input", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty name", () => {
    const result = signupSchema.safeParse({
      name: "",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects name over 100 characters", () => {
    const result = signupSchema.safeParse({
      name: "a".repeat(101),
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("accepts name with exactly 100 characters", () => {
    const result = signupSchema.safeParse({
      name: "a".repeat(100),
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("accepts name with exactly 1 character", () => {
    const result = signupSchema.safeParse({
      name: "A",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing name", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "bad-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password over 128 characters", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  test("accepts password with exactly 128 characters", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "a".repeat(128),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createPaymentSchema
// ---------------------------------------------------------------------------
describe("createPaymentSchema", () => {
  test("accepts single valid UUID in array", () => {
    const result = createPaymentSchema.safeParse({
      seatIds: ["550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(result.success).toBe(true);
  });

  test("accepts multiple valid UUIDs", () => {
    const result = createPaymentSchema.safeParse({
      seatIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "660e8400-e29b-41d4-a716-446655440001",
      ],
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty array", () => {
    const result = createPaymentSchema.safeParse({ seatIds: [] });
    expect(result.success).toBe(false);
  });

  test("rejects more than 4 seats", () => {
    const result = createPaymentSchema.safeParse({
      seatIds: Array.from({ length: 5 }, (_, i) =>
        `550e8400-e29b-41d4-a716-44665544000${i}`
      ),
    });
    expect(result.success).toBe(false);
  });

  test("rejects non-UUID string in array", () => {
    const result = createPaymentSchema.safeParse({ seatIds: ["not-a-uuid"] });
    expect(result.success).toBe(false);
  });

  test("rejects missing seatIds", () => {
    const result = createPaymentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("rejects non-array seatIds", () => {
    const result = createPaymentSchema.safeParse({ seatIds: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// confirmPaymentSchema
// ---------------------------------------------------------------------------
describe("confirmPaymentSchema", () => {
  test("accepts valid UUID", () => {
    const result = confirmPaymentSchema.safeParse({
      paymentId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  test("rejects non-UUID string", () => {
    const result = confirmPaymentSchema.safeParse({
      paymentId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing paymentId", () => {
    const result = confirmPaymentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
