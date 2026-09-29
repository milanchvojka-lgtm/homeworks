import "server-only";
import { db } from "./db";
import { sendPush } from "./push";
import { pickReminder, type OpenCheck } from "./reminders-pure";
import { startOfDayPrague } from "./time";

/** Today's checks the child still has to send (PENDING or returned). Days away have no instances (D24). */
export async function openChecksToday(userId: string, now: Date = new Date()): Promise<OpenCheck[]> {
  const rows = await db.dailyCheckInstance.findMany({
    where: { userId, date: startOfDayPrague(now), status: { in: ["PENDING", "REJECTED"] } },
    include: { dailyCheck: { select: { id: true, name: true, dueTime: true, order: true } } },
    orderBy: { dailyCheck: { order: "asc" } },
  });
  return rows.map((r) => ({ dailyCheckId: r.dailyCheck.id, name: r.dailyCheck.name, dueTime: r.dailyCheck.dueTime }));
}

/**
 * D28 cron step: every child with an active device gets at most one reminder per run, only when something is open.
 * The ReminderLog rows are claimed before sending, so a doubled cron run cannot send the same reminder twice (D21).
 * Returns the number of reminders sent.
 */
export async function sendChildReminders(now: Date = new Date()): Promise<number> {
  const today = startOfDayPrague(now);
  const children = await db.user.findMany({
    where: { role: "CHILD", pushSubscriptions: { some: { disabledAt: null } } },
    select: { id: true },
  });

  let sent = 0;
  for (const child of children) {
    const open = await openChecksToday(child.id, now);
    const logged = await db.reminderLog.findMany({ where: { userId: child.id, date: today }, select: { key: true } });
    const reminder = pickReminder(open, new Set(logged.map((l) => l.key)), now);
    if (!reminder) continue;

    const claimed = await db.reminderLog.createMany({
      data: reminder.keys.map((key) => ({ userId: child.id, date: today, key })),
      skipDuplicates: true,
    });
    if (claimed.count === 0) continue; // another run got there first
    if ((await sendPush([child.id], reminder.message)) > 0) sent++;
  }
  return sent;
}
