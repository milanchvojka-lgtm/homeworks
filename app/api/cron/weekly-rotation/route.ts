import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { assignCompetenciesForWeek } from "@/lib/rotation";
import { startOfNextWeekPrague, startOfWeekPrague } from "@/lib/time";

/**
 * Týdenní rotace kompetencí. Volá GitHub Actions cron neděli pozdě večer.
 * Vytváří `CompetencyAssignment` pro NÁSLEDUJÍCÍ týden (start = příští pondělí).
 * Idempotentní. D21: přiřadí i běžící týden, kdyby běh po půlnoci „příští týden“ přeskočil.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const current = await assignCompetenciesForWeek(startOfWeekPrague());
  const nextWeekStart = startOfNextWeekPrague();
  const result = await assignCompetenciesForWeek(nextWeekStart);

  return NextResponse.json(
    { status: "ok", weekStart: nextWeekStart.toISOString(), ...result, currentCreated: current.created },
    { headers: { "cache-control": "no-store" } },
  );
}
