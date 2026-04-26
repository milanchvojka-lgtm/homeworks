import { describe, expect, it } from "vitest";
import { evaluateBonusStatus, type BonusCheck } from "@/lib/bonus-pure";
import {
  endOfMonthPrague,
  isLastDayOfMonthInPrague,
  startOfMonthPrague,
} from "@/lib/time";

describe("evaluateBonusStatus", () => {
  it("empty list → still in game", () => {
    expect(evaluateBonusStatus([])).toEqual({ stillInGame: true });
  });

  it("all approved/submitted/pending → still in game", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-01"), status: "APPROVED" },
      { date: new Date("2026-04-02"), status: "SUBMITTED" },
      { date: new Date("2026-04-03"), status: "PENDING" },
    ];
    expect(evaluateBonusStatus(items)).toEqual({ stillInGame: true });
  });

  it("any MISSED → lostOn that date", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-01"), status: "APPROVED" },
      { date: new Date("2026-04-05"), status: "MISSED" },
      { date: new Date("2026-04-10"), status: "APPROVED" },
    ];
    const r = evaluateBonusStatus(items);
    expect(r.stillInGame).toBe(false);
    if (!r.stillInGame) {
      expect(r.lostOn.toISOString()).toBe("2026-04-05T00:00:00.000Z");
    }
  });

  it("REJECTED counts the same as MISSED", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-07"), status: "REJECTED" },
    ];
    const r = evaluateBonusStatus(items);
    expect(r.stillInGame).toBe(false);
  });

  it("multiple failures → earliest wins", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-15"), status: "MISSED" },
      { date: new Date("2026-04-10"), status: "REJECTED" },
      { date: new Date("2026-04-20"), status: "MISSED" },
    ];
    const r = evaluateBonusStatus(items);
    if (!r.stillInGame) {
      expect(r.lostOn.toISOString()).toBe("2026-04-10T00:00:00.000Z");
    }
  });
});

describe("month boundaries in Prague", () => {
  it("startOfMonthPrague returns 1st 00:00 Prague (CEST in April)", () => {
    const apr15 = new Date("2026-04-15T12:00:00Z");
    // 1.4.2026 00:00 Prague = 31.3.2026 22:00 UTC (CEST = UTC+2)
    expect(startOfMonthPrague(apr15).toISOString()).toBe(
      "2026-03-31T22:00:00.000Z",
    );
  });

  it("endOfMonthPrague returns last day 23:59:59.999 Prague", () => {
    const apr15 = new Date("2026-04-15T12:00:00Z");
    // 30.4.2026 23:59:59.999 Prague = 30.4.2026 21:59:59.999 UTC (CEST)
    expect(endOfMonthPrague(apr15).toISOString()).toBe(
      "2026-04-30T21:59:59.999Z",
    );
  });

  it("isLastDayOfMonthInPrague: late on the 30th April Prague", () => {
    // 30.4.2026 23:30 Prague = 21:30 UTC (CEST)
    expect(
      isLastDayOfMonthInPrague(new Date("2026-04-30T21:30:00Z")),
    ).toBe(true);
  });

  it("isLastDayOfMonthInPrague: 29th Apr Prague is NOT last", () => {
    expect(
      isLastDayOfMonthInPrague(new Date("2026-04-29T12:00:00Z")),
    ).toBe(false);
  });
});
