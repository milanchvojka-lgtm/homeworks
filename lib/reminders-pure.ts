import { dueDateToday } from "./deadline-pure";

/** D28: minutes before a check's due time when the child gets a reminder. */
export const DUE_REMINDER_MINUTES = 60;
/** D28: evening summary and last chance, Europe/Prague "HH:mm". */
export const EVENING_AT = "19:30";
export const LAST_CHANCE_AT = "21:30";

export type OpenCheck = { dailyCheckId: string; name: string; dueTime: string | null };

export type PushMessage = {
  title: string;
  body: string;
  /** Opens this path on tap. */
  url: string;
  /** Same tag replaces the previous notification instead of stacking. */
  tag: string;
  /** Number on the app icon. */
  badge: number;
};

export type Reminder = { keys: string[]; message: PushMessage };

/**
 * Which reminder (at most one per run) a child should get now.
 * `open` = today's checks still to send (PENDING or REJECTED); nothing open → nothing sent.
 * `sentKeys` = keys already in ReminderLog for today, so a late or doubled cron run never repeats one.
 * Windows end where the next reminder takes over, so a cron running late skips a stale reminder.
 */
export function pickReminder(open: OpenCheck[], sentKeys: ReadonlySet<string>, now: Date): Reminder | null {
  if (open.length === 0) return null;

  const evening = dueDateToday(EVENING_AT, now);
  const last = dueDateToday(LAST_CHANCE_AT, now);
  const names = open.map((c) => c.name).join(", ");
  const base = { url: "/child", tag: "reminder", badge: open.length };

  if (now >= last) {
    if (sentKeys.has("last")) return null;
    return {
      keys: ["last"],
      message: { ...base, title: "Poslední šance na dnešek", body: `${names}. O půlnoci to propadne.` },
    };
  }

  if (now >= evening) {
    if (sentKeys.has("evening")) return null;
    return {
      keys: ["evening"],
      message: {
        ...base,
        title: "Ještě ti něco zbývá",
        body: `${names}. Odškrtni to do půlnoci, ať nepřijdeš o řadu.`,
      },
    };
  }

  const dueSoon = open.filter((c) => {
    if (!c.dueTime || sentKeys.has(dueKey(c.dailyCheckId))) return false;
    const due = dueDateToday(c.dueTime, now);
    return now < due && due.getTime() - now.getTime() <= DUE_REMINDER_MINUTES * 60_000;
  });
  if (dueSoon.length === 0) return null;

  const earliest = dueSoon.map((c) => c.dueTime!).sort()[0];
  return {
    keys: dueSoon.map((c) => dueKey(c.dailyCheckId)),
    message: {
      ...base,
      title: dueSoon.length === 1 ? `Zbývá ti ${dueSoon[0].name}` : "Blíží se termín",
      body: `${dueSoon.map((c) => c.name).join(", ")} do ${earliest}. Přejeď to v appce, ať nepřijdeš o řadu.`,
    },
  };
}

export function dueKey(dailyCheckId: string): string {
  return `due:${dailyCheckId}`;
}

/** Push to the child right after a parent returns a check (D28). */
export function rejectedCheckMessage(checkName: string, note: string | null, openCount: number): PushMessage {
  return {
    title: `Vrácené: ${checkName}`,
    body: note ? `„${note}“ Oprav to a pošli znovu.` : "Oprav to a pošli znovu.",
    url: "/child",
    tag: "reminder",
    badge: openCount,
  };
}

/** Push to parents when something waits for approval (D28); one tag, so it replaces the previous one. */
export function approvalMessage(title: string, kind: string, inboxCount: number): PushMessage {
  return {
    title,
    body: `${kind}. Ke schválení: ${inboxCount}`,
    url: "/admin",
    tag: "approvals",
    badge: inboxCount,
  };
}
