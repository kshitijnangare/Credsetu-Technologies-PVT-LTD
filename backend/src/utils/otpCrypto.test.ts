import { describe, expect, it } from "vitest";
import { generateOtp, hashOtp, otpHashesMatch } from "./otpCrypto.js";

describe("OTP crypto", () => {
  it("generates a 4-digit numeric OTP", () => {
    expect(generateOtp()).toMatch(/^\d{4}$/);
  });

  it("hashes an OTP so the plaintext is not stored", () => {
    const hash = hashOtp("1234", "secret");
    expect(hash).not.toBe("1234");
    expect(hash).toHaveLength(64);
    expect(otpHashesMatch("1234", hash, "secret")).toBe(true);
    expect(otpHashesMatch("0000", hash, "secret")).toBe(false);
  });

  it("rejects hashes created with a different secret", () => {
    const hash = hashOtp("1234", "secret-a");
    expect(otpHashesMatch("1234", hash, "secret-b")).toBe(false);
  });
});
