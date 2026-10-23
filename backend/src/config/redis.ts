import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis =
  env.redisUrl.startsWith("redis://") || env.redisUrl.startsWith("rediss://")
    ? new Redis(env.redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      })
    : new Redis({
        host: env.redisUrl,
        port: env.redisPort,
        username: env.redisUser,
        password: env.redisPassword,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 100, 3000),
      });

redis.on("error", (err) => {
  console.error("⚠️ [Redis Error]:", err.message);
});

export const otpKey = (phoneNumber: string): string => `miniledger:otp:${phoneNumber}`;
