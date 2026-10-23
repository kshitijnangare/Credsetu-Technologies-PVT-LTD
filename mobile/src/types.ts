export type LoanStatus = "PENDING" | "REPAID";

export type Loan = {
  id: string;
  userId: string;
  friendName: string;
  amount: number;
  dueDate: string;
  status: LoanStatus;
  receiptUrl: string | null;
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoanSummary = {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
};

export type AuthUser = {
  id: string;
  phoneNumber: string;
  createdAt: string;
};
