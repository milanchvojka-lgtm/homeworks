import { vi } from "vitest";
import { Prisma, type User } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { PRAGUE_TZ } from "@/lib/time";
import { hashPin } from "@/lib/auth";
import { actor } from "./setup";

import * as rollover from "@/app/api/cron/daily-rollover/route";
import * as dailyClose from "@/app/api/cron/daily-close/route";
import * as monthlyClose from "@/app/api/cron/monthly-close/route";
import * as weeklyClose from "@/app/api/cron/weekly-close/route";
import * as recurring from "@/app/api/cron/recurring-tasks/route";
import * as claimTimeout from "@/app/api/cron/claim-timeout/route";
import * as reminders from "@/app/api/cron/reminders/route";

const CRONS = {
  "daily-rollover": rollover,
  "daily-close": dailyClose,
  "monthly-close": monthlyClose,
  "weekly-close": weeklyClose,
  "recurring-tasks": recurring,
  "claim-timeout": claimTimeout,
  reminders,
} as const;
export type CronName = keyof typeof CRONS;

/** Simulated wall clock in Prague: `at("2026-10-25", "02:30")`. */
export function at(day: string, time: string): Date {
  return fromZonedTime(`${day}T${time}:00`, PRAGUE_TZ);
}

export function setClock(date: Date) {
  vi.setSystemTime(date);
}

/** Calls a cron handler exactly like GitHub Actions does (Bearer CRON_SECRET). */
export async function cron(name: CronName): Promise<Record<string, unknown>> {
  const res = await CRONS[name].GET(
    new Request(`http://sim/api/cron/${name}`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }),
  );
  if (res.status !== 200) throw new Error(`cron ${name} → HTTP ${res.status}`);
  return res.json();
}

/** Runs the next server action(s) as this user. */
export function asUser(user: User) {
  actor.user = user;
}

/** Empties the test schema (guarded in setup.ts to `homeworks_test`). */
export async function wipe() {
  const tables = Prisma.dmmf.datamodel.models.map((m) => `"homeworks_test"."${m.dbName ?? m.name}"`);
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${tables.join(", ")} CASCADE`);
}

export type Family = {
  milan: User;
  teri: User;
  ani: User;
  emi: User;
  neli: User;
  kids: User[];
};

/** Pilot-like household: 2 parents, 3 kids, 3 competencies, 3 tasks, trophies 7/14/30. */
export async function seedFamily(): Promise<Family> {
  // Test PIN 1234, so the simulated month can be browsed locally afterwards (D22).
  const pinHash = await hashPin("1234");
  // Ani and Emi already use the app; Neli starts on day 1 with the welcome and a temporary PIN (D25).
  const onboarded = new Date("2026-09-01T10:00:00Z");
  const mk = (name: string, role: "ADMIN" | "CHILD", rotationOrder: number | null, fresh = false) =>
    db.user.create({
      data: {
        name,
        role,
        pinHash,
        rotationOrder,
        avatarColor: "#888888",
        onboardedAt: fresh ? null : onboarded,
        pinIsTemporary: fresh,
      },
    });
  const milan = await mk("Milan", "ADMIN", null);
  const teri = await mk("Teri", "ADMIN", null);
  const ani = await mk("Ani", "CHILD", 1);
  const emi = await mk("Emi", "CHILD", 2);
  const neli = await mk("Neli", "CHILD", 3, true);

  const comp = async (name: string, order: number, checks: [string, string | null][]) =>
    db.competency.create({
      data: {
        name,
        order,
        dailyChecks: {
          create: checks.map(([n, dueTime], i) => ({ name: n, dueTime, timeOfDay: "EVENING", order: i })),
        },
      },
    });
  // D32 catalog: three roles rotating daily; only the kitchen round has a deadline.
  await comp("Kuchyň a stůl", 1, [
    ["Myčka je prázdná", "17:00"],
    ["Linka je volná a čistá", "17:00"],
    ["Stůl je připravený k jídlu", "17:00"],
  ]);
  await comp("Obývák", 2, [
    ["Na kanapi se dá sednout", null],
    ["Obývák je vyvětraný", null],
    ["Povrchy v obýváku jsou volné", null],
  ]);
  await comp("Prádlo a koupelna", 3, [
    ["Čisté prádlo je u majitelů", null],
    ["Koupelny jsou v pořádku", null],
  ]);

  const task = (name: string, valueCzk: number, frequencyDays: number | null, executeTimeoutHours: number) =>
    db.task.create({
      data: { name, valueCzk, frequencyDays, executeTimeoutHours, claimTimeoutHours: 24, createdById: milan.id },
    });
  await task("Půdička", 75, 2, 3);
  await task("Umýt okna", 300, 3, 6);
  await task("Umýt auto", 450, null, 8);

  for (const [days, rewardCzk, trophyName] of [
    [7, 20, "Iron Will"],
    [14, 50, "Steady"],
    [30, 100, "Flawless Month"],
  ] as const) {
    await db.streakMilestone.create({ data: { days, rewardCzk, trophyName, emoji: "*", sortOrder: days } });
  }
  await db.appSettings.create({ data: {} });

  return { milan, teri, ani, emi, neli, kids: [ani, emi, neli] };
}
