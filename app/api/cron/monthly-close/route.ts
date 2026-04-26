import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { getBonusStatus } from "@/lib/bonus";
import { getAppSettings } from "@/lib/credit";
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
 *   - Pokud bonus je still in game a měsíc skončil → vytvoř CreditTransaction
 *     MONTHLY_BONUS s amountCzk = AppSettings.monthlyBonusCzk.
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

  const settings = await getAppSettings();
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
    if (!status.stillInGame) {
      lost++;
      continue;
    }

    await db.creditTransaction.create({
      data: {
        userId: child.id,
        amountCzk: settings.monthlyBonusCzk,
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
