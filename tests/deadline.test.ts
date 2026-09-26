import { describe, expect, it } from "vitest";
import { dueDateToday, dueLabel, remaining } from "@/lib/deadline-pure";

// 2026-09-26 is summer time in Prague (UTC+2).
const at = (iso: string) => new Date(iso);

describe("dueDateToday", () => {
  it("uses the given HH:mm in Prague", () => {
    expect(dueDateToday("17:00", at("2026-09-26T12:00:00Z")).toISOString()).toBe(
      "2026-09-26T15:00:00.000Z",
    );
  });
  it("falls back to 23:59 without due time", () => {
    expect(dueDateToday(null, at("2026-09-26T12:00:00Z")).toISOString()).toBe(
      "2026-09-26T21:59:00.000Z",
    );
  });
  it("falls back to 23:59 on invalid due time", () => {
    expect(dueDateToday("25:00", at("2026-09-26T12:00:00Z")).toISOString()).toBe(
      "2026-09-26T21:59:00.000Z",
    );
  });
  it("uses the Prague calendar day shortly after midnight UTC", () => {
    // 00:30 Prague on 27. 9. = 22:30 UTC on 26. 9.
    expect(dueDateToday("17:00", at("2026-09-26T22:30:00Z")).toISOString()).toBe(
      "2026-09-27T15:00:00.000Z",
    );
  });
  it("handles winter time", () => {
    expect(dueDateToday("17:00", at("2026-12-10T10:00:00Z")).toISOString()).toBe(
      "2026-12-10T16:00:00.000Z",
    );
  });
});

describe("dueLabel", () => {
  it("formats due time and default", () => {
    expect(dueLabel("17:00")).toBe("DO 17:00");
    expect(dueLabel(null)).toBe("DO 23:59");
  });
});

describe("remaining", () => {
  const deadline = at("2026-09-26T15:00:00Z");
  it("hours and minutes", () => {
    expect(remaining(deadline, at("2026-09-26T11:48:00Z"))).toEqual({
      text: "zbývá 3 h 12 min",
      soon: false,
      past: false,
    });
  });
  it("soon under an hour", () => {
    expect(remaining(deadline, at("2026-09-26T14:35:00Z"))).toEqual({
      text: "zbývá 25 min",
      soon: true,
      past: false,
    });
  });
  it("past deadline", () => {
    expect(remaining(deadline, at("2026-09-26T15:01:00Z"))).toEqual({
      text: "po termínu",
      soon: true,
      past: true,
    });
  });
});
