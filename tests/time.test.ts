import { describe, expect, it } from "vitest";
import {
  dayOfWeekInPrague,
  endOfWeekPrague,
  hourInPrague,
  startOfDayPrague,
  startOfNextWeekPrague,
  startOfWeekPrague,
} from "@/lib/time";

describe("startOfWeekPrague", () => {
  it("monday in winter (CET, UTC+1) returns same monday 00:00 Prague", () => {
    const wed = new Date("2026-01-14T15:00:00Z"); // Wed 16:00 Prague (CET)
    const start = startOfWeekPrague(wed);
    // Monday 2026-01-12 00:00 Prague = 2026-01-11 23:00 UTC
    expect(start.toISOString()).toBe("2026-01-11T23:00:00.000Z");
  });

  it("monday in summer (CEST, UTC+2) returns same monday 00:00 Prague", () => {
    const wed = new Date("2026-07-15T13:00:00Z"); // Wed 15:00 Prague (CEST)
    const start = startOfWeekPrague(wed);
    // Monday 2026-07-13 00:00 Prague = 2026-07-12 22:00 UTC
    expect(start.toISOString()).toBe("2026-07-12T22:00:00.000Z");
  });

  it("sunday belongs to the week starting on the previous monday", () => {
    const sun = new Date("2026-01-18T22:00:00Z"); // Sun 23:00 Prague
    expect(startOfWeekPrague(sun).toISOString()).toBe(
      "2026-01-11T23:00:00.000Z",
    );
  });
});

describe("endOfWeekPrague", () => {
  it("returns sunday 23:59 Prague", () => {
    const wed = new Date("2026-01-14T12:00:00Z");
    const end = endOfWeekPrague(wed);
    // Sunday 2026-01-18 23:59:59.999 Prague = 22:59:59.999 UTC
    expect(end.toISOString()).toBe("2026-01-18T22:59:59.999Z");
  });
});

describe("startOfNextWeekPrague", () => {
  it("returns next monday 00:00 Prague", () => {
    const wed = new Date("2026-01-14T12:00:00Z");
    expect(startOfNextWeekPrague(wed).toISOString()).toBe(
      "2026-01-18T23:00:00.000Z",
    );
  });
});

describe("startOfDayPrague", () => {
  it("at 23:30 Prague returns same calendar day's 00:00", () => {
    // Prague 2026-04-15 23:30 = UTC 2026-04-15 21:30 (CEST)
    const d = new Date("2026-04-15T21:30:00Z");
    // Start of day 2026-04-15 00:00 Prague = 2026-04-14 22:00 UTC
    expect(startOfDayPrague(d).toISOString()).toBe(
      "2026-04-14T22:00:00.000Z",
    );
  });

  it("just after midnight Prague returns that day's 00:00", () => {
    // Prague 2026-04-16 00:30 = UTC 2026-04-15 22:30
    const d = new Date("2026-04-15T22:30:00Z");
    expect(startOfDayPrague(d).toISOString()).toBe(
      "2026-04-15T22:00:00.000Z",
    );
  });
});

describe("hourInPrague", () => {
  it("respects DST in summer", () => {
    // 2026-07-01 12:00 UTC → 14:00 Prague
    expect(hourInPrague(new Date("2026-07-01T12:00:00Z"))).toBe(14);
  });
  it("respects standard time in winter", () => {
    // 2026-01-01 12:00 UTC → 13:00 Prague
    expect(hourInPrague(new Date("2026-01-01T12:00:00Z"))).toBe(13);
  });
});

describe("dayOfWeekInPrague", () => {
  it("midnight UTC sunday is still sunday in Prague (winter)", () => {
    // Sun 2026-01-18 00:30 UTC → Sun 01:30 Prague
    expect(dayOfWeekInPrague(new Date("2026-01-18T00:30:00Z"))).toBe(0);
  });

  it("late sunday UTC is monday in Prague", () => {
    // Sun 2026-01-18 23:30 UTC → Mon 00:30 Prague
    expect(dayOfWeekInPrague(new Date("2026-01-18T23:30:00Z"))).toBe(1);
  });
});
