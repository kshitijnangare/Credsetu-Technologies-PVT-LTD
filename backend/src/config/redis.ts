import { Redis } from "@upstash/redis";
import { env } from "./env.js";

export const redis = new Redis({
  url: env.upstashRedisUrl,
  token: env.upstashRedisToken,
});

export const otpKey = (phoneNumber: string): string => `miniledger:otp:${phoneNumber}`;
