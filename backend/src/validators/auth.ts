import Joi from "joi";

export const phoneNumberSchema = Joi.string()
  .trim()
  .pattern(/^\+?[0-9]{10,15}$/)
  .required()
  .messages({
    "string.pattern.base": "Phone number must be 10-15 digits and may start with +",
    "any.required": "Phone number is required",
  });

export const sendOtpSchema = Joi.object({
  phoneNumber: phoneNumberSchema,
});

export const verifyOtpSchema = Joi.object({
  phoneNumber: phoneNumberSchema,
  otp: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "OTP must be a 4-digit code",
      "any.required": "OTP is required",
    }),
});

export const otpQuerySchema = Joi.object({
  phoneNumber: phoneNumberSchema,
});
