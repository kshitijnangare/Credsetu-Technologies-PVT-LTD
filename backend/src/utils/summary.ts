export type LoanLike = {
  amount: number;
  status: "PENDING" | "REPAID";
  dueDate: Date | string;
};

export type LoanSummary = {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
};

const toDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const startOfToday = (now: Date): Date => {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const isOverdue = (
  loan: Pick<LoanLike, "status" | "dueDate">,
  now: Date = new Date(),
): boolean => {
  if (loan.status !== "PENDING") {
    return false;
  }
  return toDate(loan.dueDate) < startOfToday(now);
};

const roundMoney = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const computeSummary = (
  loans: LoanLike[],
  now: Date = new Date(),
): LoanSummary => {
  return loans.reduce<LoanSummary>(
    (acc, loan) => {
      if (loan.status === "REPAID") {
        acc.totalRepaid = roundMoney(acc.totalRepaid + loan.amount);
      }
      if (loan.status === "PENDING") {
        acc.totalLent = roundMoney(acc.totalLent + loan.amount);
        if (isOverdue(loan, now)) {
          acc.overdueAmount = roundMoney(acc.overdueAmount + loan.amount);
        }
      }
      return acc;
    },
    { totalLent: 0, totalRepaid: 0, overdueAmount: 0 },
  );
};
