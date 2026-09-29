"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getAdminInboxCount } from "@/lib/badges";
import { sendPush } from "@/lib/push";
import { openChecksToday } from "@/lib/reminders";

export type PushActionResult = { ok: true } | { ok: false; error: string };

/** Endpoint of this device's subscription, so logout can switch it off without the browser (D28). */
const PUSH_ENDPOINT_COOKIE = "hw_push_ep";

type Subscription = { endpoint: string; keys: { p256dh: string; auth: string } };

function parseSubscription(sub: unknown): Subscription | null {
  const s = sub as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
  const short = (v: unknown) => typeof v === "string" && v.length > 0 && v.length <= 256;
  if (!s || typeof s.endpoint !== "string" || !/^https:\/\//.test(s.endpoint) || s.endpoint.length > 2048) return null;
  if (!short(s.keys?.p256dh) || !short(s.keys?.auth)) return null;
  return { endpoint: s.endpoint, keys: { p256dh: s.keys!.p256dh as string, auth: s.keys!.auth as string } };
}

/**
 * D28: stores (or re-activates) this device's subscription for the logged-in user.
 * Called after the user turns reminders on and on every app open, because iOS subscriptions can die silently.
 * The endpoint is unique per device, so on a shared device it moves to whoever logged in.
 */
export async function savePushSubscriptionAction(sub: unknown): Promise<PushActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  const parsed = parseSubscription(sub);
  if (!parsed) return { ok: false, error: "invalid" };
  const { endpoint, keys } = parsed;

  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth, disabledAt: null },
  });
  const jar = await cookies();
  // Setting a cookie refreshes the page, so only when it changes (this runs on every app open).
  if (jar.get(PUSH_ENDPOINT_COOKIE)?.value === endpoint) return { ok: true };
  jar.set(PUSH_ENDPOINT_COOKIE, endpoint, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return { ok: true };
}

/** D28: the user turned reminders off on this device. */
export async function disablePushSubscriptionAction(endpoint: string): Promise<PushActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  await db.pushSubscription.updateMany({
    where: { endpoint, userId: user.id },
    data: { disabledAt: new Date() },
  });
  return { ok: true };
}

/** Logout: this device stops getting the user's pushes; the browser subscription stays for the next login. */
export async function disableThisDevicePush(): Promise<void> {
  const endpoint = (await cookies()).get(PUSH_ENDPOINT_COOKIE)?.value;
  if (!endpoint) return;
  await db.pushSubscription.updateMany({ where: { endpoint }, data: { disabledAt: new Date() } });
}

/** D28 gate 9.0: a test push to the logged-in user's devices right after turning reminders on. */
export async function sendTestPushAction(): Promise<PushActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  const child = user.role === "CHILD";
  const badge = child ? (await openChecksToday(user.id)).length : await getAdminInboxCount();
  const reached = await sendPush([user.id], {
    title: "Připomínky zapnuté",
    body: child ? "Připomenu ti, když ti ještě něco zbývá." : "Dám ti vědět, když bude co schvalovat.",
    url: child ? "/child" : "/admin",
    tag: child ? "reminder" : "approvals",
    badge,
  });
  return reached > 0 ? { ok: true } : { ok: false, error: "not_delivered" };
}
