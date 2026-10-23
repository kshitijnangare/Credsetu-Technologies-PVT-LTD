import { computeSummary, isOverdue, type LoanLike, type LoanSummary } from "./summary.js";

export type AnalyticsLoan = LoanLike & {
  friendName: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
};

export type MonthlyPoint = {
  month: string;
  lent: number;
  repaid: number;
};

export type FriendShare = {
  friendName: string;
  outstanding: number;
  loanCount: number;
};

export type LoanAnalytics = {
  summary: LoanSummary;
  counts: {
    total: number;
    pending: number;
    repaid: number;
    overdue: number;
  };
  monthly: MonthlyPoint[];
  topFriends: FriendShare[];
};

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const monthKey = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const lastNMonths = (now: Date, count: number): string[] => {
  const keys: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    keys.push(monthKey(date));
  }
  return keys;
};

export const computeAnalytics = (
  loans: AnalyticsLoan[],
  now: Date = new Date(),
): LoanAnalytics => {
  const summary = computeSummary(loans, now);
  const pending = loans.filter((loan) => loan.status === "PENDING");
  const repaid = loans.filter((loan) => loan.status === "REPAID");
  const overdue = pending.filter((loan) => isOverdue(loan, now));

  const months = lastNMonths(now, 6);
  const monthlyMap = new Map(months.map((month) => [month, { month, lent: 0, repaid: 0 }]));

  for (const loan of loans) {
    const createdMonth = monthKey(loan.createdAt);
    const createdBucket = monthlyMap.get(createdMonth);
    if (createdBucket) {
      createdBucket.lent = roundMoney(createdBucket.lent + loan.amount);
    }

    if (loan.status === "REPAID") {
      const repaidMonth = monthKey(loan.updatedAt ?? loan.createdAt);
      const repaidBucket = monthlyMap.get(repaidMonth);
      if (repaidBucket) {
        repaidBucket.repaid = roundMoney(repaidBucket.repaid + loan.amount);
      }
    }
  }

  const friendMap = new Map<string, FriendShare>();
  for (const loan of pending) {
    const current = friendMap.get(loan.friendName) ?? {
      friendName: loan.friendName,
      outstanding: 0,
      loanCount: 0,
    };
    current.outstanding = roundMoney(current.outstanding + loan.amount);
    current.loanCount += 1;
    friendMap.set(loan.friendName, current);
  }

  const topFriends = [...friendMap.values()]
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5);

  return {
    summary,
    counts: {
      total: loans.length,
      pending: pending.length,
      repaid: repaid.length,
      overdue: overdue.length,
    },
    monthly: months.map((month) => monthlyMap.get(month) ?? { month, lent: 0, repaid: 0 }),
    topFriends,
  };
};
