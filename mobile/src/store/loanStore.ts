import { create } from "zustand";
import { getErrorMessage, loanApi } from "../api/client";
import type { Loan, LoanAnalytics, LoanSummary } from "../types";

type LoanState = {
  loans: Loan[];
  summary: LoanSummary;
  analytics: LoanAnalytics | null;
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  createLoan: (payload: {
    friendName: string;
    amount: string;
    dueDate: string;
    receiptUri?: string | null;
  }) => Promise<void>;
  repayLoan: (id: string) => Promise<void>;
};

const emptySummary: LoanSummary = {
  totalLent: 0,
  totalRepaid: 0,
  overdueAmount: 0,
};

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  summary: emptySummary,
  analytics: null,
  loading: false,
  error: null,
  loadDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const [loans, summary] = await Promise.all([loanApi.list(), loanApi.summary()]);
      set({ loans, summary, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
  loadAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const analytics = await loanApi.analytics();
      set({ analytics, summary: analytics.summary, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
  createLoan: async (payload) => {
    await loanApi.create(payload);
    await get().loadDashboard();
  },
  repayLoan: async (id) => {
    await loanApi.repay(id);
    await get().loadDashboard();
  },
}));
