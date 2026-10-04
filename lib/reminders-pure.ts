import { dueDateToday } from "./deadline-pure";

/** D28: minutes before a check's due time when the child gets a reminder. */
export const DUE_REMINDER_MINUTES = 60;
/** D28: evening summary and last chance, Europe/Prague "HH:mm". */
export const EVENING_AT = "19:30";
export const LAST_CHANCE_AT = "21:30";
/** D32: today's role, after school, every day. */
export const ROLE_AT = "14:00";

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
 * Czech plural for the count of open checks: ["zbývá", "1 povinnost"], ["zbývají", "2 povinnosti"], ["zbývá", "5 povinností"].
 * Milan 2026-09-29: messages stay generic (no check names, notes or kids' names), only the count.
 */
export function checksLeft(n: number): [verb: string, count: string] {
  if (n === 1) return ["zbývá", "1 povinnost"];
  if (n >= 2 && n <= 4) return ["zbývají", `${n} povinnosti`];
  return ["zbývá", `${n} povinností`];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Which reminder (at most one per run) a child should get now.
 * `open` = today's checks still to send (PENDING or REJECTED); nothing open → nothing sent.
 * `sentKeys` = keys already in ReminderLog for today, so a late or doubled cron run never repeats one.
 * Windows end where the next reminder takes over, so a cron running late skips a stale reminder.
 * `role` = today's role name (D32); without it the role reminder is skipped.
 */
export function pickReminder(
  open: OpenCheck[],
  sentKeys: ReadonlySet<string>,
  now: Date,
  role: string | null = null,
): Reminder | null {
  if (open.length === 0) return null;

  const evening = dueDateToday(EVENING_AT, now);
  const last = dueDateToday(LAST_CHANCE_AT, now);
  const [verb, n] = checksLeft(open.length);
  const count = `${capitalize(verb)} ti ${n}`;
  const base = { url: "/child", tag: "reminder", badge: open.length };

  if (now >= last) {
    if (sentKeys.has("last")) return null;
    return {
      keys: ["last"],
      message: { ...base, title: "Poslední šance na dnešek", body: `${count}. O půlnoci to propadne.` },
    };
  }

  if (now >= evening) {
    if (sentKeys.has("evening")) return null;
    return {
      keys: ["evening"],
      message: {
        ...base,
        title: "Ještě ti něco zbývá",
        body: `${count}. Odškrtni to do půlnoci, ať nepřijdeš o řadu.`,
      },
    };
  }

  const dueSoon = open.filter((c) => {
    if (!c.dueTime || sentKeys.has(dueKey(c.dailyCheckId))) return false;
    const due = dueDateToday(c.dueTime, now);
    return now < due && due.getTime() - now.getTime() <= DUE_REMINDER_MINUTES * 60_000;
  });
  if (dueSoon.length === 0) return roleReminder(open, sentKeys, now, role, evening, base);

  const earliest = dueSoon.map((c) => c.dueTime!).sort()[0];
  return {
    keys: dueSoon.map((c) => dueKey(c.dailyCheckId)),
    message: {
      ...base,
      title: "Blíží se termín",
      body: `Do ${earliest} ti ${checksLeft(dueSoon.length).join(" ")}. Odškrtni to, ať nepřijdeš o řadu.`,
    },
  };
}

/**
 * D32: "Dnes máš Kuchyň a stůl · Do 17:00." from 14:00, once a day. The window ends where the next
 * reminder takes over: one hour before the earliest due time of what is open, or the evening summary.
 */
function roleReminder(
  open: OpenCheck[],
  sentKeys: ReadonlySet<string>,
  now: Date,
  role: string | null,
  evening: Date,
  base: Omit<PushMessage, "title" | "body">,
): Reminder | null {
  if (!role || sentKeys.has("role") || now < dueDateToday(ROLE_AT, now)) return null;
  const earliest = open
    .map((c) => c.dueTime)
    .filter((t): t is string => t !== null)
    .sort()[0];
  const windowEnd = earliest
    ? new Date(Math.min(evening.getTime(), dueDateToday(earliest, now).getTime() - DUE_REMINDER_MINUTES * 60_000))
    : evening;
  if (now >= windowEnd) return null;
  return {
    keys: ["role"],
    message: { ...base, title: `Dnes máš ${role}`, body: earliest ? `Do ${earliest}.` : "Do večera." },
  };
}

export function dueKey(dailyCheckId: string): string {
  return `due:${dailyCheckId}`;
}

/** Push to the child right after a parent returns a check (D28). */
export function rejectedCheckMessage(openCount: number): PushMessage {
  return {
    title: "Povinnost ti byla vrácená",
    body: "Podívej se, co opravit, a pošli ji znovu.",
    url: "/child",
    tag: "reminder",
    badge: openCount,
  };
}

/** Push to parents when something waits for approval (D28); one tag, so it replaces the previous one. */
export function approvalMessage(inboxCount: number): PushMessage {
  return {
    title: "Máš co schvalovat",
    body: `Ke schválení: ${inboxCount}`,
    url: "/admin",
    tag: "approvals",
    badge: inboxCount,
  };
}

const minutesLabel = (m: number) => (m % 60 === 0 ? `${m / 60} h` : `${m} min`);

/** D30: push to the child when a parent records screen time; neutral, no "who recorded" (Milan 2026-10-03). */
export function screenRecordedMessage(minutes: number, costCzk: number, openCount: number): PushMessage {
  return {
    title: `Zapsáno ${minutesLabel(minutes)} screen time`,
    body: `−${costCzk} Kč z tvého kreditu.`,
    url: "/child/obrazovka",
    tag: "screen-time",
    badge: openCount,
  };
}

/** D30: push to the child when a parent cancels today's record (a mistake). */
export function screenCancelledMessage(minutes: number, costCzk: number, openCount: number): PushMessage {
  return {
    title: `Zápis ${minutesLabel(minutes)} zrušen`,
    body: `+${costCzk} Kč zpět.`,
    url: "/child/obrazovka",
    tag: "screen-time",
    badge: openCount,
  };
}
