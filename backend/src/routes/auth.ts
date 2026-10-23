import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/send-otp", asyncHandler(sendOtp));
authRouter.post("/verify-otp", asyncHandler(verifyOtp));
