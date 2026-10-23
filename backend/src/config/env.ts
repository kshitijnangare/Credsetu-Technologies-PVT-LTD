import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, name: string): string => {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ["1", "true", "yes"].includes(value.toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required(process.env.JWT_SECRET, "JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  otpHashSecret: process.env.OTP_HASH_SECRET ?? process.env.JWT_SECRET ?? "otp-hash-secret",
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 300),
  upstashRedisUrl: required(process.env.UPSTASH_REDIS_REST_URL, "UPSTASH_REDIS_REST_URL"),
  upstashRedisToken: required(process.env.UPSTASH_REDIS_REST_TOKEN, "UPSTASH_REDIS_REST_TOKEN"),
  databaseUrl: process.env.DATABASE_URL,
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbUser: process.env.DB_USER ?? "postgres",
  dbPassword: process.env.DB_PASSWORD ?? "",
  dbName: process.env.DB_NAME ?? "miniledger",
  dbSsl: parseBoolean(process.env.DB_SSL, false),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER ?? "miniledger/receipts",
};
