import { describe, expect, it } from "vitest";
import {
  ROTATION_EPOCH,
  computeWeekIndex,
  rotateAssignments,
} from "@/lib/rotation-pure";
import { startOfWeekPrague } from "@/lib/time";

describe("computeWeekIndex", () => {
  it("returns 0 for the epoch week", () => {
    expect(computeWeekIndex(ROTATION_EPOCH)).toBe(0);
  });

  it("increments by 1 every 7 days", () => {
    const oneWeekLater = new Date(
      ROTATION_EPOCH.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    expect(computeWeekIndex(oneWeekLater)).toBe(1);
  });

  it("ignores DST: spring forward week is still +1", () => {
    // 2026-03-29 02:00 Prague → 03:00 (DST start). Use a week containing that.
    const before = startOfWeekPrague(new Date("2026-03-23T12:00:00Z"));
    const after = startOfWeekPrague(new Date("2026-03-30T12:00:00Z"));
    expect(computeWeekIndex(after) - computeWeekIndex(before)).toBe(1);
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

  it("week 0: A→Kuchyň, B→Obývák, C→Koupelna (identity)", () => {
    expect(rotateAssignments(children, competencies, 0)).toEqual([
      { childId: "A", competency: { name: "Kuchyň" } },
      { childId: "B", competency: { name: "Obývák" } },
      { childId: "C", competency: { name: "Koupelna" } },
    ]);
  });

  it("week 1: rotates by +1", () => {
    expect(rotateAssignments(children, competencies, 1)).toEqual([
      { childId: "A", competency: { name: "Obývák" } },
      { childId: "B", competency: { name: "Koupelna" } },
      { childId: "C", competency: { name: "Kuchyň" } },
    ]);
  });

  it("week 3: cycle wraps to identity", () => {
    expect(rotateAssignments(children, competencies, 3)).toEqual(
      rotateAssignments(children, competencies, 0),
    );
  });

  it("handles negative week index (before epoch)", () => {
    expect(rotateAssignments(children, competencies, -1)).toEqual(
      rotateAssignments(children, competencies, 2),
    );
  });

  it("returns empty when no children or no competencies", () => {
    expect(rotateAssignments([], competencies, 0)).toEqual([]);
    expect(rotateAssignments(children, [], 0)).toEqual([]);
  });

  it("each child gets exactly one competency every week (no doubles)", () => {
    for (let w = 0; w < 10; w++) {
      const plan = rotateAssignments(children, competencies, w);
      const competencyNames = plan.map((p) => p.competency.name);
      expect(new Set(competencyNames).size).toBe(3);
    }
  });
});
