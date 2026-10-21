import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { generateOtp, saveOtp, verifyStoredOtp } from "../utils/otp.js";
import { sendOtpSchema, verifyOtpSchema } from "../validators/auth.js";

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber } = sendOtpSchema.parse(req.body);
  const otp = generateOtp();
  saveOtp(phoneNumber, otp);
  console.log(`🔑 [MOCK OTP] For ${phoneNumber}: ${otp}`);
  res.status(200).json({
    message: "OTP sent. Check the server logs for the mock code.",
    expiresInSeconds: 300,
  });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, otp } = verifyOtpSchema.parse(req.body);
  const isValid = verifyStoredOtp(phoneNumber, otp);
  if (!isValid) {
    throw new AppError("Invalid or expired OTP", 401);
  }

  const [user] = await User.findOrCreate({
    where: { phoneNumber },
    defaults: { phoneNumber },
  });

  const token = jwt.sign(
    { userId: user.id, phoneNumber: user.phoneNumber },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as SignOptions,
  );

  res.status(200).json({
    token,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    },
  });
};
