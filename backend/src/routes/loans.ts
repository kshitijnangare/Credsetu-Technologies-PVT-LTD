import { Router } from "express";
import {
  createLoan,
  getLoanAnalytics,
  getLoanSummary,
  listLoans,
  repayLoan,
} from "../controllers/loanController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadReceipt } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createLoanSchema, loanIdParamsSchema } from "../validators/loan.js";

export const loanRouter = Router();

loanRouter.use(requireAuth);
loanRouter.post("/", uploadReceipt.single("receipt"), validate(createLoanSchema), asyncHandler(createLoan));
loanRouter.get("/", asyncHandler(listLoans));
loanRouter.get("/summary", asyncHandler(getLoanSummary));
loanRouter.get("/analytics", asyncHandler(getLoanAnalytics));
loanRouter.patch("/:id/repay", validate(loanIdParamsSchema, "params"), asyncHandler(repayLoan));
