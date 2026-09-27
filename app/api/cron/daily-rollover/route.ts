import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { openDay } from "@/lib/day-open";

/**
 * Eager generování `DailyCheckInstance` pro dnešní den (D2), 00:05 Prague.
 * Děti, které jsou dnes pryč, instance nedostanou (D24). Idempotentní.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const result = await openDay();
  return NextResponse.json({ status: "ok", ...result }, { headers: { "cache-control": "no-store" } });
}
