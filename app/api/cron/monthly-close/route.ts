import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { getBonusStatus } from "@/lib/bonus";
import {
  endOfMonthPrague,
  isLastDayOfMonthInPrague,
  startOfMonthPrague,
  startOfWeekPrague,
} from "@/lib/time";

/**
 * Měsíční uzávěrka. Volá GitHub Actions denně v 23:58 Prague — handler sám
 * ověří, že je teď opravdu poslední den měsíce v Praze (DST safe per D5).
 *
 * Pro každé dítě:
 *   - Pokud currentBonusCzk > 0 → vytvoř CreditTransaction
 *     MONTHLY_BONUS s amountCzk = graduovaná výše bonusu (dle počtu zaváhání).
 *   - weekStart = pondělí týdne, do kterého patří poslední den měsíce.
 *     Týdenní uzávěrka pak bonus zahrne do WeeklyPayout.bonusCzk.
 *
 * Idempotentní: pokud transakce s typem MONTHLY_BONUS pro daný měsíc už existuje,
 * skip.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  if (!isLastDayOfMonthInPrague()) {
    return NextResponse.json(
      { status: "skipped", reason: "not_last_day_of_month_in_prague" },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const monthStart = startOfMonthPrague();
  const monthEnd = endOfMonthPrague();
  const weekStart = startOfWeekPrague(monthEnd);

  const children = await db.user.findMany({ where: { role: "CHILD" } });

  let credited = 0;
  let lost = 0;
  let skipped = 0;

  for (const child of children) {
    const existing = await db.creditTransaction.findFirst({
      where: {
        userId: child.id,
        type: "MONTHLY_BONUS",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    });
    if (existing) {
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
