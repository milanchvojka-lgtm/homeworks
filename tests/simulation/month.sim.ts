/**
 * D22 month simulation (`npm run test:sim`): 28. 9. – 1. 11. 2026, three kids from the scenarios,
 * two parents, cron jobs with the delays and double runs seen on GitHub Actions (D21),
 * the end of two months and the switch to winter time (25. 10.). Invariants are checked every day.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { createTaskInstance } from "@/lib/task-rotation";
import { getCurrentBalance } from "@/lib/credit";
import { startOfDayPrague } from "@/lib/time";
import { submitCheckAction, approveCheckAction, rejectCheckAction, excuseDayAction } from "@/app/actions/checks";
import { claimTaskAction, reportTaskDoneAction, approveTaskAction, rejectTaskAction } from "@/app/actions/tasks";
import {
  requestScreenTimeAction,
  approveScreenTimeAction,
  rejectScreenTimeAction,
  recordScreenTimeAction,
} from "@/app/actions/screen-time";
import { markPayoutPaidAction } from "@/app/actions/payouts";
import { asUser, at, cron, seedFamily, setClock, wipe, type Family } from "./world";
import { checkInvariants } from "./invariants";

const START = "2026-09-28"; // Monday
const DAYS = 35; // through Sunday 1. 11.

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const weekday = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay(); // 0 = Sunday

let f: Family;
const problems: string[] = [];
const events: string[] = [];
const log = (day: string, msg: string) => events.push(`${day} ${msg}`);

async function todayChecks(userId: string) {
  return db.dailyCheckInstance.findMany({ where: { userId, date: startOfDayPrague() } });
}

async function submitAll(kid: Family["ani"]) {
  asUser(kid);
  for (const c of await todayChecks(kid.id)) {
    if (c.status === "PENDING" || c.status === "REJECTED") await submitCheckAction(c.id);
  }
}

async function tryClaim(kid: Family["ani"], only?: string) {
  asUser(kid);
  const offers = await db.taskInstance.findMany({ where: { status: "AVAILABLE" }, include: { task: true } });
  for (const o of offers) {
    if (only && o.task.name !== only) continue;
    const r = await claimTaskAction(o.id);
    if (r.ok) return o;
  }
  return null;
}

async function reportMine(kid: Family["ani"]) {
  asUser(kid);
  const mine = await db.taskInstance.findMany({ where: { claimedById: kid.id, status: "CLAIMED" } });
  for (const m of mine) await reportTaskDoneAction(m.id);
}

/** Evening round of a parent. `concurrent` = both parents tap the same item at once. */
async function approveEverything(day: string, concurrent: boolean) {
  const checks = await db.dailyCheckInstance.findMany({ where: { status: "SUBMITTED" } });
  for (const c of checks) {
    asUser(f.milan);
    await approveCheckAction(c.id);
  }
  const tasks = await db.taskInstance.findMany({ where: { status: "PENDING_REVIEW" } });
  for (const t of tasks) {
    if (concurrent) {
      const [a, b] = await Promise.all([
        (async () => (asUser(f.milan), approveTaskAction(t.id)))(),
        (async () => (asUser(f.teri), approveTaskAction(t.id)))(),
      ]);
      log(day, `concurrent approve task → ${a.ok}/${b.ok}`);
    } else {
      asUser(f.teri);
      await approveTaskAction(t.id);
    }
  }
  const screens = await db.screenTimeRequest.findMany({ where: { status: "PENDING" } });
  for (const s of screens) {
    asUser(f.milan);
    const r = await approveScreenTimeAction(s.id);
    if (!r.ok && r.error === "insufficient_credit") {
      log(day, "screen time no longer covered by credit → parent returns it");
      await rejectScreenTimeAction(s.id);
    }
  }
}

/** Night closes after `day`, with the GitHub Actions chaos seen in production (D21). */
async function night(i: number, day: string) {
  const next = addDays(day, 1);
  if (i === 12) {
    log(day, "night: cron skipped entirely (caught up next night)");
    return;
  }
  const time = i % 5 === 2 ? "02:20" : "00:15"; // delayed by two hours
  setClock(at(next, time));
  await cron("daily-close");
  await cron("monthly-close");
  if (i % 7 === 3) {
    setClock(at(next, "01:15")); // the other DST trigger fires as well
    await cron("daily-close");
    await cron("monthly-close");
  }
  if (weekday(next) === 1) {
    setClock(at(next, i === 13 ? "03:30" : "00:20"));
    await cron("weekly-close");
    if (i === 20) await cron("weekly-close"); // duplicate run
  }
}

describe("month simulation (D22)", () => {
  beforeAll(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    setClock(at(addDays(START, -1), "12:00"));
    await wipe();
    f = await seedFamily();
    const auto = await db.task.findFirst({ where: { name: "Umýt auto" } });
    await createTaskInstance(auto!.id);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("runs five weeks without breaking a rule", async () => {
    for (let i = 0; i < DAYS; i++) {
      const day = addDays(START, i);
      const dow = weekday(day);

      setClock(at(day, "00:05"));
      await cron("daily-rollover");
      if (i % 6 === 1) await cron("daily-rollover"); // double trigger
      setClock(at(day, "06:00"));
      await cron("recurring-tasks");

      for (const t of ["12:00"]) {
        setClock(at(day, t));
        await cron("claim-timeout");
      }

      // 16:30 Ani: everything on time, then a task.
      setClock(at(day, "16:30"));
      await submitAll(f.ani);
      const aniTask = await tryClaim(f.ani);
      if (aniTask) log(day, `Ani claimed ${aniTask.task.name}`);

      // 18:00 Neli: checks, then Půdička sometimes; spends on screen time.
      setClock(at(day, "18:00"));
      await submitAll(f.neli);
      const neliTask = await tryClaim(f.neli, "Půdička");
      if (i % 2 === 0) {
        asUser(f.neli);
        const r = await requestScreenTimeAction(30);
        log(day, `Neli asks 30 min → ${r.ok ? "ok" : (r as { error: string }).error}`);
      }

      // 17:30 / 19:00 reports (Neli once lets her task expire).
      setClock(at(day, "19:00"));
      await reportMine(f.ani);
      if (neliTask && i !== 9) await reportMine(f.neli);
      else if (neliTask) log(day, "Neli lets Půdička expire");

      // 20:00 Emi: forgets everything on Wednesdays; takes a task on Saturdays.
      setClock(at(day, "20:00"));
      if (dow !== 3) await submitAll(f.emi);
      else log(day, "Emi forgets her checks");
      if (dow === 6) {
        const t = await tryClaim(f.emi);
        if (t) {
          setClock(at(day, "20:40"));
          await reportMine(f.emi);
        }
      }

      // Saturday: parent records screen time Ani asked for verbally (D19).
      if (dow === 6) {
        setClock(at(day, "19:30"));
        asUser(f.milan);
        const r = await recordScreenTimeAction(f.ani.id, 60);
        log(day, `Milan records 60 min for Ani → ${r.ok ? "ok" : (r as { error: string }).error}`);
      }

      for (const t of ["22:00"]) {
        setClock(at(day, t));
        await cron("claim-timeout");
      }

      // 21:30 parents. Day 8 (Tue): Neli's check returned and resubmitted. Day 10 (Thu): Ani's task returned.
      setClock(at(day, "21:30"));
      if (i === 8) {
        const c = (await todayChecks(f.neli.id)).find((x) => x.status === "SUBMITTED");
        if (c) {
          asUser(f.teri);
          await rejectCheckAction(c.id, "drobky pod stolem");
          setClock(at(day, "21:45"));
          await submitAll(f.neli);
        }
      }
      if (i === 10) {
        const t = await db.taskInstance.findFirst({ where: { claimedById: f.ani.id, status: "PENDING_REVIEW" } });
        if (t) {
          asUser(f.milan);
          await rejectTaskAction(t.id, "okna nejsou umytá");
          log(day, "Milan returns Ani's task");
        }
      }
      setClock(at(day, "22:00"));
      await approveEverything(day, dow === 4);

      // Monday evening: payouts, once by both parents at the same time.
      if (dow === 1) {
        setClock(at(day, "19:00"));
        const unpaid = await db.weeklyPayout.findMany({ where: { paidOutAt: null } });
        for (const pay of unpaid) {
          if (i === 7) {
            await Promise.all([
              (async () => (asUser(f.milan), markPayoutPaidAction(pay.id)))(),
              (async () => (asUser(f.teri), markPayoutPaidAction(pay.id)))(),
            ]);
          } else {
            asUser(f.teri);
            await markPayoutPaidAction(pay.id);
          }
        }
      }

      // Thursday after a missed Wednesday: excuse it (D20). 1. 10. is already October → must be refused.
      if (dow === 4) {
        setClock(at(day, "08:00"));
        asUser(f.milan);
        const r = await excuseDayAction(f.emi.id, at(addDays(day, -1), "12:00").toISOString());
        log(day, `excuse Emi's Wednesday → ${r.ok ? "ok" : (r as { error: string }).error}`);
        if (day === "2026-10-01" && r.ok) problems.push(`${day}: excusing 30. 9. on 1. 10. should be refused (month closed)`);
        if (day === "2026-10-08" && !r.ok) problems.push(`${day}: excusing 7. 10. should work`);
      }

      if (dow === 0) {
        setClock(at(day, "23:55"));
        await cron("weekly-rotation");
      }

      await night(i, day);
      setClock(at(addDays(day, 1), "04:00"));
      const found = await checkInvariants(day);
      problems.push(...found);
      console.log(`${day} ok${found.length ? ` — ${found.length} problem(s): ${found.join(" | ")}` : ""}`);
    }

    // Final state after the last night (Mon 2. 11.).
    const kids = await db.user.findMany({ where: { role: "CHILD" }, orderBy: { rotationOrder: "asc" } });
    const [ani, emi] = kids;
    if (ani.currentStreak !== DAYS) problems.push(`end: Ani streak ${ani.currentStreak}, expected ${DAYS}`);
    const aniTrophies = await db.trophyEarned.findMany({ where: { userId: ani.id }, include: { milestone: true } });
    const names = aniTrophies.map((t) => t.milestone.days).sort((a, b) => a - b);
    if (names.join(",") !== "7,14,30") problems.push(`end: Ani trophies ${names.join(",")}, expected 7,14,30`);
    // Emi missed every Wednesday; October ones were excused (D20), 30. 9. could not be (month closed).
    if (emi.currentStreak !== 32) problems.push(`end: Emi streak ${emi.currentStreak}, expected 32 (since 1. 10.)`);
    const sept30 = await db.dailyCheckInstance.findMany({ where: { userId: emi.id, date: startOfDayPrague(at("2026-09-30", "12:00")) } });
    if (!sept30.length || sept30.some((c) => c.status !== "MISSED")) problems.push("end: Emi's 30. 9. should stay MISSED");
    const pending = await db.dailyCheckInstance.count({ where: { status: "PENDING", date: { lt: startOfDayPrague() } } });
    if (pending) problems.push(`end: ${pending} past check(s) left PENDING`);
    const weeks = await db.weeklyPayout.groupBy({ by: ["weekStart"], _count: true });
    if (weeks.length !== 5) problems.push(`end: ${weeks.length} closed weeks, expected 5`);
    const bonuses = await db.creditTransaction.findMany({ where: { type: "MONTHLY_BONUS" } });
    const refs = [...new Set(bonuses.map((b) => b.referenceId))].sort().join(",");
    if (refs !== "2026-09,2026-10") problems.push(`end: monthly bonuses for ${refs}, expected 2026-09,2026-10`);
    for (const k of kids) {
      const bal = await getCurrentBalance(k.id);
      events.push(`end ${k.name}: streak ${k.currentStreak}, longest ${k.longestStreak}, balance ${bal} Kč`);
    }

    if (problems.length) console.log(events.join("\n"));
    else console.log(events.filter((e) => e.startsWith("end") || e.includes("excuse") || e.includes("concurrent")).join("\n"));
    expect(problems).toEqual([]);
  });
});
