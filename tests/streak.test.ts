import { describe, it, expect } from "vitest";
import {
  applyDayOutcome,
  nextTierProgress,
  tierFromStreak,
} from "@/lib/streak";

describe("tierFromStreak", () => {
  it.each([
    [0, "Bronze"],
    [6, "Bronze"],
    [7, "Silver"],
    [29, "Silver"],
    [30, "Gold"],
    [59, "Gold"],
    [60, "Platinum"],
    [99, "Platinum"],
    [100, "Diamond"],
    [364, "Diamond"],
    [365, "Master"],
    [9999, "Master"],
  ])("%d days → %s tier", (days, name) => {
    expect(tierFromStreak(days).name).toBe(name);
  });
});

describe("applyDayOutcome", () => {
  it("APPROVED increments the streak", () => {
    expect(applyDayOutcome(5, "APPROVED")).toBe(6);
  });
  it("MISSED resets the streak to 0", () => {
    expect(applyDayOutcome(40, "MISSED")).toBe(0);
  });
  it("REJECTED resets the streak to 0", () => {
    expect(applyDayOutcome(100, "REJECTED")).toBe(0);
  });
  it("APPROVED from 0 → 1", () => {
    expect(applyDayOutcome(0, "APPROVED")).toBe(1);
  });
});

describe("nextTierProgress", () => {
  it("Master tier has null remaining", () => {
    const p = nextTierProgress(400);
    expect(p.current.name).toBe("Master");
    expect(p.remaining).toBeNull();
    expect(p.progress).toBe(1);
  });

  it("17 days → Silver, ~43% progress to Gold, 13 remaining", () => {
    const p = nextTierProgress(17);
    expect(p.current.name).toBe("Silver");
    expect(p.progress).toBeCloseTo((17 - 7) / (30 - 7));
    expect(p.remaining).toBe(13);
  });

  it("at exact tier boundary (30 days), progress to Gold is 0", () => {
    const p = nextTierProgress(30);
    expect(p.current.name).toBe("Gold");
    expect(p.progress).toBe(0);
    expect(p.remaining).toBe(30); // 60 - 30
  });
});
