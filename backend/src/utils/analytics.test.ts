import { describe, expect, it } from "vitest";
import { computeAnalytics } from "./analytics.js";

describe("loan analytics", () => {
  const now = new Date("2026-10-23T10:00:00.000Z");

  it("builds counts, monthly totals, and top friends", () => {
    const analytics = computeAnalytics(
      [
        {
          friendName: "Asha",
          amount: 100,
          status: "PENDING",
          dueDate: "2026-10-30",
          createdAt: "2026-10-02T00:00:00.000Z",
        },
        {
          friendName: "Asha",
          amount: 50,
          status: "PENDING",
          dueDate: "2026-10-01",
          createdAt: "2026-09-12T00:00:00.000Z",
        },
        {
          friendName: "Rohan",
          amount: 25.5,
          status: "REPAID",
          dueDate: "2026-09-01",
          createdAt: "2026-09-02T00:00:00.000Z",
          updatedAt: "2026-10-05T00:00:00.000Z",
        },
      ],
      now,
    );

    expect(analytics.counts).toEqual({
      total: 3,
      pending: 2,
      repaid: 1,
      overdue: 1,
    });
    expect(analytics.summary.overdueAmount).toBe(50);
    expect(analytics.topFriends[0]).toMatchObject({
      friendName: "Asha",
      outstanding: 150,
      loanCount: 2,
    });
    expect(analytics.monthly).toHaveLength(6);
  });
});
