import { env } from "../config/env.js";
import { otpKey, redis } from "../config/redis.js";
import { generateOtp, hashOtp, otpHashesMatch } from "../utils/otpCrypto.js";

export type IssuedOtp = {
  otp: string;
  ttlSeconds: number;
};

export const issueOtp = async (phoneNumber: string): Promise<IssuedOtp> => {
  const key = otpKey(phoneNumber);
  await redis.del(key);

  const otp = generateOtp();
  const hashed = hashOtp(otp, env.otpHashSecret);
  const ttlSeconds = env.otpTtlSeconds;

  await redis.set(key, hashed, "EX", ttlSeconds);

  return { otp, ttlSeconds };
};

export const getOtpTtl = async (phoneNumber: string): Promise<number> => {
  const ttl = await redis.ttl(otpKey(phoneNumber));
  return ttl > 0 ? ttl : 0;
};

export const consumeOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
  const key = otpKey(phoneNumber);
  const storedHash = await redis.get(key);
  if (!storedHash) {
    return false;
  }

  const matches = otpHashesMatch(otp, storedHash, env.otpHashSecret);
  if (!matches) {
    return false;
  }

  await redis.del(key);
  return true;
};
