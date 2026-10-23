import { Router } from "express";
import {
  createLoan,
  getLoanSummary,
  listLoans,
  repayLoan,
} from "../controllers/loanController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadReceipt } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loanRouter = Router();

loanRouter.use(requireAuth);
loanRouter.post("/", uploadReceipt.single("receipt"), asyncHandler(createLoan));
loanRouter.get("/", asyncHandler(listLoans));
loanRouter.get("/summary", asyncHandler(getLoanSummary));
loanRouter.patch("/:id/repay", asyncHandler(repayLoan));
