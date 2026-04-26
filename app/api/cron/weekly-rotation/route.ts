import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { assignCompetenciesForWeek } from "@/lib/rotation";
import { startOfNextWeekPrague } from "@/lib/time";

/**
 * Týdenní rotace kompetencí. Volá GitHub Actions cron neděli pozdě večer.
 * Vytváří `CompetencyAssignment` pro NÁSLEDUJÍCÍ týden (start = příští pondělí).
 * Idempotentní.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const nextWeekStart = startOfNextWeekPrague();
  const result = await assignCompetenciesForWeek(nextWeekStart);

  return NextResponse.json(
    { status: "ok", weekStart: nextWeekStart.toISOString(), ...result },
    { headers: { "cache-control": "no-store" } },
  );
}
