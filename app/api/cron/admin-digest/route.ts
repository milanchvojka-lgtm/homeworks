import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { sendAdminDigest } from "@/lib/notifications";
import { hourInPrague } from "@/lib/time";

/**
 * Admin digest cron — volá GitHub Actions každých 15 min.
 * - Throttle 10 min od posledního digestu (řešeno v lib/notifications).
 * - Safety-net: ve 20:00 Prague pošle bez ohledu na throttle.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const force = hourInPrague() === 20;
  const sent = await sendAdminDigest(force);

  return NextResponse.json(
    { status: "ok", sent, force },
    { headers: { "cache-control": "no-store" } },
  );
}
