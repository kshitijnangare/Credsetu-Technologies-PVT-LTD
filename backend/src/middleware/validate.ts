import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
import { AppError } from "../utils/errors.js";

type RequestPart = "body" | "params" | "query";

export const validate = (schema: ObjectSchema, part: RequestPart = "body") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      next(
        new AppError(
          "Request validation failed",
          400,
          error.details.map((detail) => ({
            path: detail.path.join("."),
            message: detail.message,
          })),
        ),
      );
      return;
    }

    req[part] = value;
    next();
  };
};
