import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { closePastDays } from "@/lib/day-close";

/**
 * Denní uzávěrka (D21): zavře všechny dny před dneškem, které ještě uzavřené nejsou
 * (PENDING → MISSED, řada, trofeje). Dnešek nikdy. Nezáleží na tom, kdy a kolikrát
 * ji GitHub Actions spustí; rozvrh je po půlnoci Prague.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const result = await closePastDays();
  return NextResponse.json({ status: "ok", ...result }, { headers: { "cache-control": "no-store" } });
}
