import "server-only";
import webpush from "web-push";
import { db } from "./db";
import type { PushMessage } from "./reminders-pure";

let configured: boolean | null = null;

function configure(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    console.warn("push: VAPID env not configured, pushes are skipped");
    configured = false;
  } else {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return configured;
}

/**
 * D28: sends one message to every active device of the given users. Returns the number of devices reached.
 * Never throws — a failed push must not break the action or cron that triggered it.
 * 404/410 from the push service = subscription is dead, the row is disabled.
 */
export async function sendPush(userIds: string[], message: PushMessage): Promise<number> {
  if (userIds.length === 0 || !configure()) return 0;
  try {
    const subs = await db.pushSubscription.findMany({
      where: { userId: { in: userIds }, disabledAt: null },
    });
    const payload = JSON.stringify(message);
    const results = await Promise.all(
      subs.map(async (s) => {
        try {
          // TTL 1 h: a reminder that could not be delivered within an hour is stale.
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 3600, urgency: "high" },
          );
          await db.pushSubscription.update({ where: { id: s.id }, data: { lastSuccessAt: new Date() } });
          return 1;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await db.pushSubscription.update({ where: { id: s.id }, data: { disabledAt: new Date() } });
          } else {
            console.error("push: send failed", status, (err as Error).message);
          }
          return 0;
        }
      }),
    );
    return results.reduce<number>((a, b) => a + b, 0);
  } catch (err) {
    console.error("push: sendPush failed", err);
    return 0;
  }
}

export async function adminIds(): Promise<string[]> {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  return admins.map((a) => a.id);
}
