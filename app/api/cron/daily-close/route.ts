import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { startOfDayPrague } from "@/lib/time";

/**
 * Denní uzavření: PENDING checky pro dnešní den se označí jako MISSED.
 * SUBMITTED zůstává — admin může schválit zpětně.
 * Volá GitHub Actions 23:59 Prague.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const today = startOfDayPrague();

  const result = await db.dailyCheckInstance.updateMany({
    where: { date: today, status: "PENDING" },
    data: { status: "MISSED" },
  });

  return NextResponse.json(
    { status: "ok", date: today.toISOString(), missed: result.count },
    { headers: { "cache-control": "no-store" } },
  );
}
