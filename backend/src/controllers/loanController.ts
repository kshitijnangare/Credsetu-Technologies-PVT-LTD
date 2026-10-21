import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { Loan } from "../models/Loan.js";
import { AppError } from "../utils/errors.js";
import { computeSummary, isOverdue } from "../utils/summary.js";
import { createLoanSchema } from "../validators/loan.js";

const serializeLoan = (loan: Loan) => {
  return {
    id: loan.id,
    userId: loan.userId,
    friendName: loan.friendName,
    amount: loan.amount,
    dueDate: loan.dueDate,
    status: loan.status,
    receiptUrl: loan.receiptUrl,
    overdue: isOverdue(loan),
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };
};

export const createLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authenticated user was not found", 401);
  }

  const payload = createLoanSchema.parse(req.body);
  const receiptFile = req.file;
  const receiptUrl = receiptFile ? `/uploads/${receiptFile.filename}` : null;

  const loan = await Loan.create({
    userId,
    friendName: payload.friendName,
    amount: payload.amount,
    dueDate: payload.dueDate,
    status: "PENDING",
    receiptUrl,
  });

  res.status(201).json(serializeLoan(loan));
};

export const listLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authenticated user was not found", 401);
  }

  const loans = await Loan.findAll({
    where: { userId },
    order: [
      ["status", "ASC"],
      ["dueDate", "ASC"],
      ["createdAt", "DESC"],
    ],
  });

  res.status(200).json(loans.map(serializeLoan));
};

export const repayLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authenticated user was not found", 401);
  }

  const id = req.params.id;
  if (!id) {
    throw new AppError("Loan id is required", 400);
  }
  const loan = await Loan.findOne({ where: { id, userId } });
  if (!loan) {
    throw new AppError("Loan entry was not found", 404);
  }
  if (loan.status === "REPAID") {
    throw new AppError("This loan has already been marked as repaid", 409);
  }

  loan.status = "REPAID";
  await loan.save();
  res.status(200).json(serializeLoan(loan));
};

export const getLoanSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authenticated user was not found", 401);
  }

  const loans = await Loan.findAll({ where: { userId } });
  res.status(200).json(computeSummary(loans));
};
