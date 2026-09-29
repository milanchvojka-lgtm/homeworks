import "server-only";
import { after } from "next/server";
import { Resend } from "resend";
import { db } from "./db";
import { getAdminInboxCount } from "./badges";
import { adminIds, sendPush } from "./push";
import { approvalMessage } from "./reminders-pure";
import { startOfDayPrague } from "./time";
import type { NotificationEventType, Prisma } from "@prisma/client";

type CheckSubmittedPayload = {
  userId: string;
  userName: string;
  checkName: string;
  competencyName: string;
};

type Payload = CheckSubmittedPayload | Record<string, unknown>;

export async function enqueueNotification(
  eventType: NotificationEventType,
  payload: Payload,
): Promise<void> {
  await db.notificationQueue.create({
    data: { eventType, payload: payload as Prisma.InputJsonValue },
  });
  // D28: parents also get a push right away; the e-mail digest (D3) stays as it is.
  // After the response and never throwing, so it can neither slow down nor break the child's action.
  after(async () => {
    try {
      await sendPush(await adminIds(), approvalMessage(await getAdminInboxCount()));
    } catch (err) {
      console.error("push: approval push failed", err);
    }
  });
}

const DIGEST_THROTTLE_MIN = 10;

/**
 * Pošle souhrnný admin e-mail, pokud:
 *   - jsou unsent items v queue
 *   - poslední digest šel před >10 min (throttle)
 *   - NEBO `force=true` (safety-net evening cron)
 *
 * Vrací počet odeslaných položek (0 pokud nic neposláno).
 */
export async function sendAdminDigest(force = false): Promise<number> {
  const unsent = await db.notificationQueue.findMany({
    where: { sentAt: null },
    orderBy: { createdAt: "asc" },
  });
  if (unsent.length === 0) return 0;

  if (!force) {
    const lastLog = await db.notificationLog.findFirst({
      orderBy: { sentAt: "desc" },
    });
    if (lastLog) {
      const minutesSince = (Date.now() - lastLog.sentAt.getTime()) / 60000;
      if (minutesSince < DIGEST_THROTTLE_MIN) return 0;
    }
  }

  const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.warn("sendAdminDigest: no ADMIN_NOTIFICATION_EMAILS configured");
    return 0;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("sendAdminDigest: no RESEND_API_KEY configured");
    return 0;
  }

  const fromAddress =
    process.env.NOTIFICATION_FROM_EMAIL ?? "Homeworks <onboarding@resend.dev>";
  const appUrl = process.env.APP_URL ?? "";

  const resend = new Resend(apiKey);

  const grouped = groupByEvent(unsent);
  const subject = buildSubject(grouped, unsent.length);
  const html = buildHtml(grouped, appUrl);

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: recipients,
    subject,
    html,
  });

  if (error) {
    console.error("Resend send failed:", error);
    return 0;
  }

  await db.$transaction([
    db.notificationQueue.updateMany({
      where: { id: { in: unsent.map((n) => n.id) } },
      data: { sentAt: new Date() },
    }),
    db.notificationLog.create({ data: { itemCount: unsent.length } }),
  ]);

  return unsent.length;
}

function groupByEvent(items: { eventType: NotificationEventType; payload: Prisma.JsonValue }[]) {
  const out: Record<string, typeof items> = {};
  for (const it of items) {
    (out[it.eventType] ??= []).push(it);
  }
  return out;
}

function buildSubject(
  grouped: ReturnType<typeof groupByEvent>,
  total: number,
): string {
  const parts: string[] = [];
  if (grouped.CHECK_SUBMITTED?.length) {
    parts.push(`${grouped.CHECK_SUBMITTED.length}× check`);
  }
  if (grouped.TASK_PENDING_REVIEW?.length) {
    parts.push(`${grouped.TASK_PENDING_REVIEW.length}× úkol`);
  }
  if (grouped.SCREEN_TIME_REQUESTED?.length) {
    parts.push(`${grouped.SCREEN_TIME_REQUESTED.length}× screen time`);
  }
  return `Homeworks — ${parts.join(", ") || `${total} nových položek`} ke schválení`;
}

function buildHtml(
  grouped: ReturnType<typeof groupByEvent>,
  appUrl: string,
): string {
  const sections: string[] = [];

  if (grouped.CHECK_SUBMITTED?.length) {
    const items = grouped.CHECK_SUBMITTED.map((n) => {
      const p = n.payload as unknown as CheckSubmittedPayload;
      return `<li>${escape(p.userName)} — ${escape(p.checkName)} (${escape(p.competencyName)})</li>`;
    }).join("");
    sections.push(`<h3>Denní checky (${grouped.CHECK_SUBMITTED.length})</h3><ul>${items}</ul>`);
  }

  const link = appUrl
    ? `<p><a href="${appUrl}/admin">→ Otevřít Inbox</a></p>`
    : "";

  return `
    <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
      <h2>Čeká na schválení</h2>
      ${sections.join("")}
      ${link}
    </div>
  `.trim();
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const UNSENT_EMAIL_KEY = "parents-email";

/**
 * D28 (B): from 20:00 Prague the parents get one e-mail listing today's checks the children have not sent yet,
 * plus the children whose reminders are off (then the parents cannot count on the push).
 * Only when something is open; each child is logged in ReminderLog, so repeated cron runs send it once.
 * A failed send releases the log so the next run retries. `error` is set when it could not be sent.
 */
export async function sendUnsentChecksEmail(now: Date = new Date()): Promise<{ sent: number; error?: string }> {
  const today = startOfDayPrague(now);
  const rows = await db.dailyCheckInstance.findMany({
    where: { date: today, status: { in: ["PENDING", "REJECTED"] }, user: { role: "CHILD" } },
    include: {
      user: { select: { id: true, name: true, pushSubscriptions: { where: { disabledAt: null }, select: { id: true } } } },
      dailyCheck: { select: { name: true, order: true } },
    },
    orderBy: [{ user: { name: "asc" } }, { dailyCheck: { order: "asc" } }],
  });
  if (rows.length === 0) return { sent: 0 };

  const byChild = new Map<string, { name: string; checks: string[]; remindersOn: boolean }>();
  for (const r of rows) {
    const entry = byChild.get(r.user.id) ?? { name: r.user.name, checks: [], remindersOn: r.user.pushSubscriptions.length > 0 };
    entry.checks.push(r.dailyCheck.name);
    byChild.set(r.user.id, entry);
  }

  const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const apiKey = process.env.RESEND_API_KEY;
  if (recipients.length === 0 || !apiKey) return { sent: 0, error: "e-mail not configured" };

  const childIds = [...byChild.keys()];
  const claimed = await db.reminderLog.createMany({
    data: childIds.map((userId) => ({ userId, date: today, key: UNSENT_EMAIL_KEY })),
    skipDuplicates: true,
  });
  if (claimed.count === 0) return { sent: 0 };

  const kids = [...byChild.values()];
  const items = kids
    .map((c) => {
      const off = c.remindersOn ? "" : " <em>(nemá zapnuté připomínky)</em>";
      return `<li><strong>${escape(c.name)}</strong>: ${c.checks.map(escape).join(", ")}${off}</li>`;
    })
    .join("");
  const appUrl = process.env.APP_URL ?? "";
  const link = appUrl ? `<p><a href="${appUrl}/admin/deti">→ Otevřít Děti</a></p>` : "";
  const release = () =>
    db.reminderLog.deleteMany({ where: { userId: { in: childIds }, date: today, key: UNSENT_EMAIL_KEY } });

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.NOTIFICATION_FROM_EMAIL ?? "Homeworks <onboarding@resend.dev>",
      to: recipients,
      subject: `Homeworks — ${kids.map((c) => c.name).join(", ")}: ještě neodesláno`,
      html: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
        <h2>Dnes ještě neodesláno</h2>
        <ul>${items}</ul>
        <p>O půlnoci to propadne.</p>
        ${link}
      </div>
    `.trim(),
    });
    if (error) {
      await release();
      return { sent: 0, error: `resend: ${error.message}` };
    }
  } catch (err) {
    await release();
    return { sent: 0, error: `resend: ${(err as Error).message}` };
  }
  return { sent: byChild.size };
}
