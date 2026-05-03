import { describe, it, expect } from "vitest";
import { computeMonthlyBonus } from "@/lib/bonus-graduated";

describe("computeMonthlyBonus — default 200 Kč / 50 Kč step", () => {
  const opts = { fullCzk: 200, stepCzk: 50 };
  it.each([
    [0, 200],
    [1, 150],
    [2, 100],
    [3, 50],
    [4, 0],
    [5, 0],
    [10, 0],
  ])("%d misses → %d Kč", (misses, expected) => {
    expect(computeMonthlyBonus({ misses, ...opts })).toBe(expected);
  });
});

describe("computeMonthlyBonus — configurable full / step", () => {
  it("300 / 100 step → 300 / 200 / 100 / 0 / 0", () => {
    const opts = { fullCzk: 300, stepCzk: 100 };
    expect(computeMonthlyBonus({ misses: 0, ...opts })).toBe(300);
    expect(computeMonthlyBonus({ misses: 1, ...opts })).toBe(200);
    expect(computeMonthlyBonus({ misses: 2, ...opts })).toBe(100);
    expect(computeMonthlyBonus({ misses: 3, ...opts })).toBe(0);
    expect(computeMonthlyBonus({ misses: 4, ...opts })).toBe(0);
  });

  it("100 / 25 step → 100 / 75 / 50 / 25 / 0", () => {
    const opts = { fullCzk: 100, stepCzk: 25 };
    expect(computeMonthlyBonus({ misses: 0, ...opts })).toBe(100);
    expect(computeMonthlyBonus({ misses: 1, ...opts })).toBe(75);
    expect(computeMonthlyBonus({ misses: 4, ...opts })).toBe(0);
  });
});

describe("computeMonthlyBonus — edge cases", () => {
  it("0 misses with 0 Kč full bonus = 0 Kč", () => {
    expect(computeMonthlyBonus({ misses: 0, fullCzk: 0, stepCzk: 50 })).toBe(0);
  });

  it("0 step never decays — always full", () => {
    const opts = { fullCzk: 200, stepCzk: 0 };
    expect(computeMonthlyBonus({ misses: 100, ...opts })).toBe(200);
  });

  it("step > full → first miss already 0", () => {
    expect(computeMonthlyBonus({ misses: 1, fullCzk: 100, stepCzk: 200 })).toBe(0);
  });
});
