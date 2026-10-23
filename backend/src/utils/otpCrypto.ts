import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const generateOtp = (): string => {
  return String(randomInt(1000, 10000));
};

export const hashOtp = (otp: string, secret: string): string => {
  return createHmac("sha256", secret).update(otp).digest("hex");
};

export const otpHashesMatch = (plainOtp: string, storedHash: string, secret: string): boolean => {
  const computed = hashOtp(plainOtp, secret);
  const computedBuffer = Buffer.from(computed, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }
  return timingSafeEqual(computedBuffer, storedBuffer);
};
