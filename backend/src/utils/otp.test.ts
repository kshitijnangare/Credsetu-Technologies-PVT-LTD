import { describe, expect, it } from "vitest";
import { generateOtp, resetOtpStore, saveOtp, verifyStoredOtp } from "./otp.js";

describe("OTP helpers", () => {
  it("generates a 4-digit numeric OTP", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{4}$/);
  });

  it("accepts a matching OTP and rejects reuse", () => {
    resetOtpStore();
    saveOtp("9999999999", "1234");
    expect(verifyStoredOtp("9999999999", "1234")).toBe(true);
    expect(verifyStoredOtp("9999999999", "1234")).toBe(false);
  });

  it("rejects an incorrect OTP", () => {
    resetOtpStore();
    saveOtp("8888888888", "4321");
    expect(verifyStoredOtp("8888888888", "0000")).toBe(false);
  });
});
