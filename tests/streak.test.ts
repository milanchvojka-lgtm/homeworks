import { describe, it, expect } from "vitest";
import {
  applyDayOutcome,
  dayResult,
  replayStreak,
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

describe("dayResult", () => {
  it("any MISSED or REJECTED fails the day", () => {
    expect(dayResult(["APPROVED", "MISSED"])).toBe("FAIL");
    expect(dayResult(["SUBMITTED", "REJECTED"])).toBe("FAIL");
  });
  it("APPROVED and SUBMITTED only is OK (daily-close rule)", () => {
    expect(dayResult(["APPROVED", "SUBMITTED"])).toBe("OK");
  });
});

describe("replayStreak", () => {
  it("empty history", () => {
    expect(replayStreak([])).toEqual({ current: 0, longest: 0, breaks: 0, cycleStart: 0 });
  });
  it("counts trailing OK days as current streak", () => {
    expect(replayStreak(["OK", "FAIL", "OK", "OK"])).toEqual({
      current: 2,
      longest: 2,
      breaks: 1,
      cycleStart: 2,
    });
  });
  it("a FAIL with streak 0 is not a break", () => {
    expect(replayStreak(["FAIL", "FAIL", "OK"]).breaks).toBe(0);
  });
  it("excusing a day joins the streak and removes the break", () => {
    const before = replayStreak(["OK", "OK", "FAIL", "OK", "OK"]);
    const after = replayStreak(["OK", "OK", "OK", "OK", "OK"]);
    expect(before).toMatchObject({ current: 2, longest: 2, breaks: 1 });
    expect(after).toMatchObject({ current: 5, longest: 5, breaks: 0, cycleStart: 0 });
  });
});
