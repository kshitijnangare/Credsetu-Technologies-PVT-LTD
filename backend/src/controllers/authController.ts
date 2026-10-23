import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { consumeOtp, getOtpTtl, issueOtp } from "../services/otpService.js";
import { AppError } from "../utils/errors.js";

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber } = req.body as { phoneNumber: string };
  const { otp, ttlSeconds } = await issueOtp(phoneNumber);
  console.log(`🔑 [MOCK OTP] For ${phoneNumber}: ${otp}`);

  res.status(200).json({
    message: "OTP sent. Check the server logs for the mock code.",
    expiresInSeconds: ttlSeconds,
  });
};

export const getOtpStatus = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber } = req.query as { phoneNumber: string };
  const ttlSeconds = await getOtpTtl(phoneNumber);
  res.status(200).json({
    ttlSeconds,
    canResend: ttlSeconds === 0,
  });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, otp } = req.body as { phoneNumber: string; otp: string };
  const isValid = await consumeOtp(phoneNumber, otp);
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
