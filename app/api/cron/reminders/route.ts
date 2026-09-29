import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { sendUnsentChecksEmail } from "@/lib/notifications";
import { pushConfigured } from "@/lib/push";
import { sendChildReminders } from "@/lib/reminders";
import { hourInPrague } from "@/lib/time";

/**
 * D28: volá GitHub Actions každých 15 min.
 * - Push připomínky dětem (60 min před termínem, 19:30, 21:30), jen když něco zbývá.
 * - Od 20:00 do půlnoci Prague e-mail rodičům o neodeslaném (jednou za den; okno do půlnoci kvůli zpožděným
 *   během GitHub Actions, D21).
 * - Chybějící VAPID / e-mailové proměnné nebo neodeslaný e-mail = HTTP 500, ať úloha zčervená (tichá
 *   selhání pojistky, tech lead 2026-09-29).
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const now = new Date();
  const errors: string[] = [];
  if (!pushConfigured()) errors.push("VAPID env not configured");
  const reminders = await sendChildReminders(now);
  const email = hourInPrague(now) >= 20 ? await sendUnsentChecksEmail(now) : { sent: 0 };
  if (email.error) errors.push(email.error);

  return NextResponse.json(
    { status: errors.length ? "error" : "ok", reminders, unsentEmail: email.sent, errors },
    { status: errors.length ? 500 : 200, headers: { "cache-control": "no-store" } },
  );
}
