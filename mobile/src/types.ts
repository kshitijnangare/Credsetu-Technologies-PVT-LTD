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

export type LoanAnalytics = {
  summary: LoanSummary;
  counts: {
    total: number;
    pending: number;
    repaid: number;
    overdue: number;
  };
  monthly: Array<{
    month: string;
    lent: number;
    repaid: number;
  }>;
  topFriends: Array<{
    friendName: string;
    outstanding: number;
    loanCount: number;
  }>;
};

export type AuthUser = {
  id: string;
  phoneNumber: string;
  createdAt: string;
};

export type AppScreen = "dashboard" | "analytics";
