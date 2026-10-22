import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} was not found`,
  });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Request validation failed",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const code = String((err as { code?: string }).code);
    if (code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Receipt image must be 5MB or smaller" });
      return;
    }
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "An unexpected server error occurred",
  });
};
