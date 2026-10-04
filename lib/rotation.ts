import "server-only";
import { db } from "./db";
import { startOfDayPrague } from "./time";
import { computeDayIndex, rotateAssignments } from "./rotation-pure";

export {
  ROTATION_EPOCH,
  computeDayIndex,
  rotateAssignments,
} from "./rotation-pure";

/**
 * Pro každé dítě přiřadí kompetenci na daný den (D32). Rotace: 3 holky × 3 kompetence, posun každý den.
 * Idempotentní: existující assignment pro (userId, date) přeskakuje.
 */
export async function assignCompetenciesForDay(day: Date): Promise<{
  created: number;
  skipped: number;
}> {
  const date = startOfDayPrague(day);
  const [children, competencies] = await Promise.all([
    db.user.findMany({ where: { role: "CHILD" }, orderBy: { rotationOrder: "asc" } }),
    db.competency.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (children.length === 0 || competencies.length === 0) {
    return { created: 0, skipped: 0 };
  }

  const plan = rotateAssignments(children, competencies, computeDayIndex(date));
  const { count } = await db.competencyAssignment.createMany({
    data: plan.map(({ childId, competency }) => ({
      userId: childId,
      competencyId: competency.id,
      date,
    })),
    skipDuplicates: true,
  });
  return { created: count, skipped: plan.length - count };
}

/** Assignment dítěte na daný den (nebo null). */
export async function getCurrentAssignment(userId: string, date: Date = new Date()) {
  return db.competencyAssignment.findUnique({
    where: { userId_date: { userId, date: startOfDayPrague(date) } },
    include: { competency: true },
  });
}
