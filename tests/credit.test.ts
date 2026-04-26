import { describe, expect, it } from "vitest";
import {
  aggregateTransactions,
  computeScreenTimeCost,
  computeWeeklyPayout,
  isValidScreenTimeMinutes,
  type Transaction,
} from "@/lib/credit-pure";

describe("computeScreenTimeCost", () => {
  it("60 min @ 200 Kč/h = 200 Kč", () => {
    expect(computeScreenTimeCost(60, 200)).toBe(200);
  });
  it("30 min @ 200 Kč/h = 100 Kč", () => {
    expect(computeScreenTimeCost(30, 200)).toBe(100);
  });
  it("90 min @ 200 Kč/h = 300 Kč", () => {
    expect(computeScreenTimeCost(90, 200)).toBe(300);
  });
  it("rounds non-integer cost", () => {
    // 45 min @ 200 Kč/h = 150
    expect(computeScreenTimeCost(45, 200)).toBe(150);
    // 30 min @ 99 Kč/h = 49.5 → 50
    expect(computeScreenTimeCost(30, 99)).toBe(50);
  });
  it("non-positive returns 0", () => {
    expect(computeScreenTimeCost(0, 200)).toBe(0);
    expect(computeScreenTimeCost(-30, 200)).toBe(0);
    expect(computeScreenTimeCost(30, 0)).toBe(0);
  });
});

describe("isValidScreenTimeMinutes", () => {
  it("accepts positive multiples of granularity", () => {
    expect(isValidScreenTimeMinutes(30, 30)).toBe(true);
    expect(isValidScreenTimeMinutes(60, 30)).toBe(true);
    expect(isValidScreenTimeMinutes(90, 30)).toBe(true);
  });
  it("rejects zero, negative, non-integer", () => {
    expect(isValidScreenTimeMinutes(0, 30)).toBe(false);
    expect(isValidScreenTimeMinutes(-30, 30)).toBe(false);
    expect(isValidScreenTimeMinutes(45.5, 30)).toBe(false);
  });
  it("rejects non-multiples", () => {
    expect(isValidScreenTimeMinutes(45, 30)).toBe(false);
    expect(isValidScreenTimeMinutes(20, 30)).toBe(false);
  });
});

describe("aggregateTransactions", () => {
  it("sums earned, screen time, balance correctly", () => {
    const txs: Transaction[] = [
      { type: "TASK_REWARD", amountCzk: 100 },
      { type: "TASK_REWARD", amountCzk: 50 },
      { type: "SCREEN_TIME", amountCzk: -100 },
      { type: "MONTHLY_BONUS", amountCzk: 200 },
      { type: "ADJUSTMENT", amountCzk: -10 },
    ];
    const r = aggregateTransactions(txs);
    expect(r.earnedCzk).toBe(350); // 100 + 50 + 200
    expect(r.screenTimeCzk).toBe(100); // abs of -100
    expect(r.balanceCzk).toBe(240); // 100+50-100+200-10
  });

  it("empty list → all zeros", () => {
    expect(aggregateTransactions([])).toEqual({
      earnedCzk: 0,
      screenTimeCzk: 0,
      balanceCzk: 0,
    });
  });

  it("PAYOUT does not count as earned", () => {
    const txs: Transaction[] = [
      { type: "TASK_REWARD", amountCzk: 100 },
      { type: "PAYOUT", amountCzk: -100 },
    ];
    const r = aggregateTransactions(txs);
    expect(r.earnedCzk).toBe(100);
    expect(r.balanceCzk).toBe(0);
  });
});

describe("computeWeeklyPayout", () => {
  it("earned - screen + bonus", () => {
    expect(
      computeWeeklyPayout({ earnedCzk: 380, screenTimeCzk: 100, bonusCzk: 0 }),
    ).toBe(280);
  });

  it("clamps to 0 when negative", () => {
    expect(
      computeWeeklyPayout({ earnedCzk: 50, screenTimeCzk: 200, bonusCzk: 0 }),
    ).toBe(0);
  });

  it("includes monthly bonus", () => {
    expect(
      computeWeeklyPayout({ earnedCzk: 100, screenTimeCzk: 0, bonusCzk: 200 }),
    ).toBe(300);
  });
});
