import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { sendUnsentChecksEmail } from "@/lib/notifications";
import { sendChildReminders } from "@/lib/reminders";
import { hourInPrague } from "@/lib/time";

/**
 * D28: volá GitHub Actions každých 15 min.
 * - Push připomínky dětem (60 min před termínem, 19:30, 21:30), jen když něco zbývá.
 * - Ve 20:00–20:59 Prague e-mail rodičům o neodeslaném (jednou za den).
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const now = new Date();
  const reminders = await sendChildReminders(now);
  const unsentEmail = hourInPrague(now) === 20 ? await sendUnsentChecksEmail(now) : 0;

  return NextResponse.json(
    { status: "ok", reminders, unsentEmail },
    { headers: { "cache-control": "no-store" } },
  );
}
