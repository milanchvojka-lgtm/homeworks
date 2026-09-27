import { describe, it, expect } from "vitest";
import { checkAbsenceRange, coversDay } from "@/lib/absence-pure";
import { startOfDayPrague } from "@/lib/time";

const day = (iso: string) => startOfDayPrague(new Date(`${iso}T12:00:00Z`));
const now = new Date("2026-10-08T10:00:00Z"); // Thu 8. 10.

describe("checkAbsenceRange", () => {
  it("allows the running week back to Monday and any future end", () => {
    expect(checkAbsenceRange(day("2026-10-05"), day("2026-10-20"), now)).toBeNull();
  });
  it("refuses a start in a closed week", () => {
    expect(checkAbsenceRange(day("2026-10-04"), day("2026-10-06"), now)).toBe("before_week");
  });
  it("refuses an end before the start", () => {
    expect(checkAbsenceRange(day("2026-10-09"), day("2026-10-08"), now)).toBe("to_before_from");
  });
  it("refuses the closed month even inside the running week", () => {
    // Thu 1. 10.: Monday 28. 9. is in the running week but September is closed.
    expect(checkAbsenceRange(day("2026-09-29"), day("2026-10-02"), new Date("2026-10-01T10:00:00Z"))).toBe(
      "month_closed",
    );
  });
});

describe("coversDay", () => {
  const a = { fromDate: day("2026-10-05"), toDate: day("2026-10-10") };
  it("includes both ends", () => {
    expect(coversDay(a, new Date("2026-10-05T00:30:00+02:00"))).toBe(true);
    expect(coversDay(a, new Date("2026-10-10T23:30:00+02:00"))).toBe(true);
  });
  it("excludes the day after", () => {
    expect(coversDay(a, new Date("2026-10-11T00:10:00+02:00"))).toBe(false);
  });
});
