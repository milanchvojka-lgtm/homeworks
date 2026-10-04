import { describe, expect, it } from "vitest";
import {
  ROTATION_EPOCH,
  computeDayIndex,
  rotateAssignments,
} from "@/lib/rotation-pure";
import { startOfDayPrague } from "@/lib/time";

describe("computeDayIndex", () => {
  it("returns 0 for the epoch day", () => {
    expect(computeDayIndex(ROTATION_EPOCH)).toBe(0);
  });

  it("increments by 1 every day", () => {
    const next = startOfDayPrague(new Date("2025-12-30T12:00:00+01:00"));
    expect(computeDayIndex(next)).toBe(1);
  });

  it("ignores DST: spring forward (23 h day) and fall back (25 h day) are still +1", () => {
    // 2026-03-29 02:00 → 03:00, 2026-10-25 03:00 → 02:00 (Prague).
    for (const [a, b] of [
      ["2026-03-28T12:00:00Z", "2026-03-29T12:00:00Z"],
      ["2026-03-29T12:00:00Z", "2026-03-30T12:00:00Z"],
      ["2026-10-24T12:00:00Z", "2026-10-25T12:00:00Z"],
      ["2026-10-25T12:00:00Z", "2026-10-26T12:00:00Z"],
    ]) {
      const before = startOfDayPrague(new Date(a));
      const after = startOfDayPrague(new Date(b));
      expect(computeDayIndex(after) - computeDayIndex(before)).toBe(1);
    }
  });

  it("is an integer a year from the epoch, across both DST changes", () => {
    const day = startOfDayPrague(new Date("2026-12-29T12:00:00+01:00"));
    expect(computeDayIndex(day)).toBe(365);
  });
});

describe("rotateAssignments", () => {
  const children = [
    { id: "A" },
    { id: "B" },
    { id: "C" },
  ];
  const competencies = [
    { name: "Kuchyň" },
    { name: "Obývák" },
    { name: "Koupelna" },
  ];

  it("day 0: A→Kuchyň, B→Obývák, C→Koupelna (identity)", () => {
    expect(rotateAssignments(children, competencies, 0)).toEqual([
      { childId: "A", competency: { name: "Kuchyň" } },
      { childId: "B", competency: { name: "Obývák" } },
      { childId: "C", competency: { name: "Koupelna" } },
    ]);
  });

  it("day 1: rotates by +1", () => {
    expect(rotateAssignments(children, competencies, 1)).toEqual([
      { childId: "A", competency: { name: "Obývák" } },
      { childId: "B", competency: { name: "Koupelna" } },
      { childId: "C", competency: { name: "Kuchyň" } },
    ]);
  });

  it("day 3: cycle wraps to identity", () => {
    expect(rotateAssignments(children, competencies, 3)).toEqual(
      rotateAssignments(children, competencies, 0),
    );
  });

  it("handles negative day index (before epoch)", () => {
    expect(rotateAssignments(children, competencies, -1)).toEqual(
      rotateAssignments(children, competencies, 2),
    );
  });

  it("three days in a row: every child goes through all three roles", () => {
    for (const child of children) {
      const roles = [0, 1, 2].map(
        (d) => rotateAssignments(children, competencies, d).find((p) => p.childId === child.id)!.competency.name,
      );
      expect(new Set(roles).size).toBe(3);
    }
  });

  it("returns empty when no children or no competencies", () => {
    expect(rotateAssignments([], competencies, 0)).toEqual([]);
    expect(rotateAssignments(children, [], 0)).toEqual([]);
  });

  it("each child gets exactly one competency every day (no doubles)", () => {
    for (let w = 0; w < 10; w++) {
      const plan = rotateAssignments(children, competencies, w);
      const competencyNames = plan.map((p) => p.competency.name);
      expect(new Set(competencyNames).size).toBe(3);
    }
  });
});
