import { describe, expect, it } from "vitest";
import { sendOtpSchema, verifyOtpSchema } from "./auth.js";
import { createLoanSchema } from "./loan.js";

describe("request validation", () => {
  it("accepts a valid phone number and OTP", () => {
    expect(sendOtpSchema.parse({ phoneNumber: "9876543210" }).phoneNumber).toBe("9876543210");
    expect(verifyOtpSchema.parse({ phoneNumber: "+919876543210", otp: "1234" }).otp).toBe("1234");
  });

  it("rejects invalid auth payloads", () => {
    expect(() => sendOtpSchema.parse({ phoneNumber: "abc" })).toThrow();
    expect(() => verifyOtpSchema.parse({ phoneNumber: "9876543210", otp: "12" })).toThrow();
  });

  it("validates loan input", () => {
    const loan = createLoanSchema.parse({
      friendName: "Asha",
      amount: "250.5",
      dueDate: "2026-11-01",
    });
    expect(loan.amount).toBe(250.5);
    expect(() =>
      createLoanSchema.parse({ friendName: "A", amount: -1, dueDate: "not-a-date" }),
    ).toThrow();
  });
});
