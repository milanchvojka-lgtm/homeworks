import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { getBonusStatus } from "@/lib/bonus";
import { closePastDays } from "@/lib/day-close";
import { monthRef, previousMonthEnd } from "@/lib/day-close-pure";
import { startOfMonthPrague, startOfWeekPrague } from "@/lib/time";

/**
 * Měsíční uzávěrka (D21): zavírá PŘEDCHOZÍ, už skončený měsíc, takže nezáleží na tom,
 * kdy ji GitHub Actions spustí. Nejdřív uzavře dny (poslední den měsíce se započítá).
 *
 * Pro každé dítě, které v měsíci mělo povinnosti:
 *   - Pokud currentBonusCzk > 0 → CreditTransaction MONTHLY_BONUS (graduovaná výše),
 *     weekStart = BĚŽÍCÍ týden, aby ho zahrnula příští týdenní výplata.
 * Idempotentní přes referenceId "RRRR-MM".
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  await closePastDays();
  const now = new Date();
  const monthEnd = previousMonthEnd(now);
  const monthStart = startOfMonthPrague(monthEnd);
  const ref = monthRef(monthEnd);
  const weekStart = startOfWeekPrague(now);

  const children = await db.user.findMany({ where: { role: "CHILD" } });

  let credited = 0;
  let lost = 0;
  let skipped = 0;

  for (const child of children) {
    const existing = await db.creditTransaction.findFirst({
      where: {
        userId: child.id,
        type: "MONTHLY_BONUS",
        referenceId: ref,
      },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // No checks that month (child added later, or before the pilot) → no bonus to earn.
    const hadChecks = await db.dailyCheckInstance.count({
      where: { userId: child.id, date: { gte: monthStart, lte: monthEnd } },
    });
    if (hadChecks === 0) {
      skipped++;
      continue;
    }

    const status = await getBonusStatus(child.id, monthEnd);
    if (status.currentBonusCzk === 0) {
      lost++;
      continue;
    }

    await db.creditTransaction.create({
      data: {
        userId: child.id,
        amountCzk: status.currentBonusCzk,
        type: "MONTHLY_BONUS",
        referenceId: ref,
        weekStart,
        note: `Měsíční bonus za ${monthEnd.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}`,
      },
    });
    credited++;
  }

  return NextResponse.json(
    {
      status: "ok",
      monthEnd: monthEnd.toISOString(),
      credited,
      lost,
      skipped,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
