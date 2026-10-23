import { describe, expect, it } from "vitest";
import { sendOtpSchema, verifyOtpSchema } from "./auth.js";
import { createLoanSchema } from "./loan.js";

describe("Joi request validation", () => {
  it("accepts a valid phone number and OTP", () => {
    expect(sendOtpSchema.validate({ phoneNumber: "9876543210" }).error).toBeUndefined();
    expect(verifyOtpSchema.validate({ phoneNumber: "+919876543210", otp: "1234" }).error).toBeUndefined();
  });

  it("rejects invalid auth payloads", () => {
    expect(sendOtpSchema.validate({ phoneNumber: "abc" }).error).toBeDefined();
    expect(verifyOtpSchema.validate({ phoneNumber: "9876543210", otp: "12" }).error).toBeDefined();
  });

  it("validates loan input and coerces amount", () => {
    const { value, error } = createLoanSchema.validate({
      friendName: "Asha",
      amount: "250.5",
      dueDate: "2026-11-01",
    });
    expect(error).toBeUndefined();
    expect(value.amount).toBe(250.5);
    expect(
      createLoanSchema.validate({ friendName: "A", amount: -1, dueDate: "not-a-date" }).error,
    ).toBeDefined();
  });
});
