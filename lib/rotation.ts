import "server-only";
import { db } from "./db";
import { endOfWeekPrague, startOfWeekPrague } from "./time";

/**
 * Pro každé dítě přiřadí kompetenci pro daný týden podle rotation logiky.
 *
 * Rotace: 3 holky × 3 kompetence, posun každý týden.
 *   weekIndex 0: child[i] → competency[i]
 *   weekIndex 1: child[i] → competency[(i + 1) % 3]
 *   weekIndex 2: child[i] → competency[(i + 2) % 3]
 *
 * Idempotentní: existující assignmenty pro daný (userId, weekStart) přeskakuje.
 *
 * `weekIndex` se počítá jako počet týdnů od pevného anchoru (epoch monday).
 */
export async function assignCompetenciesForWeek(weekStart: Date): Promise<{
  created: number;
  skipped: number;
}> {
  const weekEnd = endOfWeekPrague(weekStart);

  const children = await db.user.findMany({
    where: { role: "CHILD" },
    orderBy: { rotationOrder: "asc" },
  });
  const competencies = await db.competency.findMany({
    orderBy: { order: "asc" },
  });

  if (children.length === 0 || competencies.length === 0) {
    return { created: 0, skipped: 0 };
  }

  const weekIndex = computeWeekIndex(weekStart);
  const offset = ((weekIndex % competencies.length) + competencies.length) %
    competencies.length;

  let created = 0;
  let skipped = 0;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const competency = competencies[(i + offset) % competencies.length];

    const exists = await db.competencyAssignment.findUnique({
      where: { userId_weekStart: { userId: child.id, weekStart } },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await db.competencyAssignment.create({
      data: {
        userId: child.id,
        competencyId: competency.id,
        weekStart,
        weekEnd,
      },
    });
    created++;
  }

  return { created, skipped };
}

/** Pevný anchor — pondělí 2025-12-29 00:00 Prague (libovolné, fixní). */
const ROTATION_EPOCH = startOfWeekPrague(new Date("2025-12-29T00:00:00+01:00"));

function computeWeekIndex(weekStart: Date): number {
  const ms = weekStart.getTime() - ROTATION_EPOCH.getTime();
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}

/** Vrátí aktuální assignment pro dané dítě v daném týdnu (nebo null). */
export async function getCurrentAssignment(userId: string, date: Date = new Date()) {
  const weekStart = startOfWeekPrague(date);
  return db.competencyAssignment.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: { competency: true },
  });
}
