import { describe, expect, it } from "vitest";
import { computeSummary, isOverdue } from "./summary.js";

describe("loan summary", () => {
  const now = new Date("2026-10-23T10:00:00.000Z");

  it("computes lent, repaid, and overdue totals", () => {
    const summary = computeSummary(
      [
        { amount: 100, status: "PENDING", dueDate: "2026-10-30" },
        { amount: 50, status: "PENDING", dueDate: "2026-10-01" },
        { amount: 25.5, status: "REPAID", dueDate: "2026-09-01" },
      ],
      now,
    );

    expect(summary).toEqual({
      totalLent: 150,
      totalRepaid: 25.5,
      overdueAmount: 50,
    });
  });

  it("marks only pending past-due loans as overdue", () => {
    expect(isOverdue({ status: "PENDING", dueDate: "2026-10-22" }, now)).toBe(true);
    expect(isOverdue({ status: "PENDING", dueDate: "2026-10-23" }, now)).toBe(false);
    expect(isOverdue({ status: "REPAID", dueDate: "2026-10-01" }, now)).toBe(false);
  });
});
