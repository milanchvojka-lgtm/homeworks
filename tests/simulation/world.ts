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
import * as weeklyRotation from "@/app/api/cron/weekly-rotation/route";
import * as recurring from "@/app/api/cron/recurring-tasks/route";
import * as claimTimeout from "@/app/api/cron/claim-timeout/route";

const CRONS = {
  "daily-rollover": rollover,
  "daily-close": dailyClose,
  "monthly-close": monthlyClose,
  "weekly-close": weeklyClose,
  "weekly-rotation": weeklyRotation,
  "recurring-tasks": recurring,
  "claim-timeout": claimTimeout,
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
  const mk = (name: string, role: "ADMIN" | "CHILD", rotationOrder: number | null) =>
    db.user.create({ data: { name, role, pinHash, rotationOrder, avatarColor: "#888888" } });
  const milan = await mk("Milan", "ADMIN", null);
  const teri = await mk("Teri", "ADMIN", null);
  const ani = await mk("Ani", "CHILD", 1);
  const emi = await mk("Emi", "CHILD", 2);
  const neli = await mk("Neli", "CHILD", 3);

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
  await comp("Kuchyň", 1, [
    ["Linka prázdná", "17:00"],
    ["Kuchyň připravená na ráno", null],
  ]);
  await comp("Stůl", 2, [
    ["Stůl čistý", "17:00"],
    ["Stůl čistý na ráno", null],
  ]);
  await comp("Kanape", 3, [["Kanape prázdné", "17:00"]]);

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
