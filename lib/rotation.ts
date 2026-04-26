import "server-only";
import { db } from "./db";
import { endOfWeekPrague, startOfWeekPrague } from "./time";
import { computeWeekIndex, rotateAssignments } from "./rotation-pure";

export {
  ROTATION_EPOCH,
  computeWeekIndex,
  rotateAssignments,
} from "./rotation-pure";

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
  const plan = rotateAssignments(children, competencies, weekIndex);

  let created = 0;
  let skipped = 0;
  for (const { childId, competency } of plan) {
    const child = { id: childId };

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

/** Vrátí aktuální assignment pro dané dítě v daném týdnu (nebo null). */
export async function getCurrentAssignment(userId: string, date: Date = new Date()) {
  const weekStart = startOfWeekPrague(date);
  return db.competencyAssignment.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: { competency: true },
  });
}
