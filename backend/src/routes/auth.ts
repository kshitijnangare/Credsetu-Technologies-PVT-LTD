import { Router } from "express";
import { getOtpStatus, sendOtp, verifyOtp } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { otpQuerySchema, sendOtpSchema, verifyOtpSchema } from "../validators/auth.js";

export const authRouter = Router();

authRouter.post("/send-otp", validate(sendOtpSchema), asyncHandler(sendOtp));
authRouter.post("/resend-otp", validate(sendOtpSchema), asyncHandler(sendOtp));
authRouter.get("/otp-status", validate(otpQuerySchema, "query"), asyncHandler(getOtpStatus));
authRouter.post("/verify-otp", validate(verifyOtpSchema), asyncHandler(verifyOtp));
