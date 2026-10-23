import Joi from "joi";

export const createLoanSchema = Joi.object({
  friendName: Joi.string().trim().min(2).max(80).required().messages({
    "string.min": "Friend name must be at least 2 characters",
    "string.max": "Friend name must be 80 characters or fewer",
    "any.required": "Friend name is required",
  }),
  amount: Joi.number().positive().max(1_000_000_000).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),
  dueDate: Joi.date().iso().required().messages({
    "date.base": "Due date must be a valid date",
    "any.required": "Due date is required",
  }),
});

export const loanIdParamsSchema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.guid": "Loan id must be a valid UUID",
    "any.required": "Loan id is required",
  }),
});
