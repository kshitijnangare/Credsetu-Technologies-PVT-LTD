import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, "Phone number must be 10-15 digits and may start with +");

export const sendOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export const verifyOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: z.string().regex(/^\d{4}$/, "OTP must be a 4-digit code"),
});
