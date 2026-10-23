import { z } from "zod";

export const createLoanSchema = z.object({
  friendName: z
    .string()
    .trim()
    .min(2, "Friend name must be at least 2 characters")
    .max(80, "Friend name must be 80 characters or fewer"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(1_000_000_000, "Amount is too large"),
  dueDate: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Due date must be a valid date"),
});
