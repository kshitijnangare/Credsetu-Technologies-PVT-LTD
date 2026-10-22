import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export type AuthPayload = {
  userId: string;
  phoneNumber: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthPayload;
};

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Authorization token is required", 401));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError("Authorization token is required", 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
    if (!decoded.userId || !decoded.phoneNumber) {
      next(new AppError("Invalid authorization token", 401));
      return;
    }
    req.user = { userId: decoded.userId, phoneNumber: decoded.phoneNumber };
    next();
  } catch {
    next(new AppError("Invalid or expired authorization token", 401));
  }
};
