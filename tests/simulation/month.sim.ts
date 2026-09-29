/**
 * D22 month simulation (`npm run test:sim`): 28. 9. – 1. 11. 2026, three kids from the scenarios,
 * two parents, cron jobs with the delays and double runs seen on GitHub Actions (D21),
 * the end of two months and the switch to winter time (25. 10.). Invariants are checked every day.
 * D24: Neli at camp 5.–10. 10. (ended early on 9. 10.), the whole family away 23.–25. 10.,
 * Emi's illness on 14. 10. entered the next morning.
 * D25: Neli starts on 28. 9. with the welcome (bonus once), her own PIN and a trial week in which
 * she forgets 1. 10. without losing streak or bonus.
 * D28: every kid and parent has a device; reminders run at 19:30 and 21:35 (twice) and the parents'
 * unsent e-mail at 20:05. No reminder may reach a child with nothing open, none may repeat, the icon
 * number must match what is open, and returned checks / new approvals push right away.
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
import { createAbsenceAction, endAbsenceAction } from "@/app/actions/absence";
import { completeWelcomeAction, setOwnPinAction } from "@/app/actions/welcome";
import { absentUserIds } from "@/lib/absence";
import { openChecksToday } from "@/lib/reminders";
import { emails, flushAfter, pushes } from "./setup";
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

/** D28: runs the reminders cron and checks every reminder it sent against what is really open. */
async function runReminders(day: string, time: string, twice = false) {
  setClock(at(day, time));
  const before = pushes.length;
  await cron("reminders");
  if (twice) await cron("reminders");
  const sent = pushes.slice(before).filter((p) => p.message.tag === "reminder");
  for (const p of sent) {
    for (const id of p.userIds) {
      const open = await openChecksToday(id);
      if (open.length === 0) problems.push(`${day} ${time}: reminder "${p.message.title}" to a child with nothing open`);
      else if (p.message.badge !== open.length) problems.push(`${day} ${time}: icon number ${p.message.badge}, open ${open.length}`);
    }
  }
  if (twice && new Set(sent.map((p) => p.userIds.join())).size !== sent.length) {
    problems.push(`${day} ${time}: a doubled cron run sent a reminder twice`);
  }
  return sent;
}

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
    // D28: one device each.
    for (const u of [f.milan, f.teri, ...f.kids]) {
      await db.pushSubscription.create({
        data: { userId: u.id, endpoint: `https://push.sim/${u.id}`, p256dh: "p", auth: "a" },
      });
    }
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

      // D25: Neli's first launch (welcome twice must credit the bonus once; 0000 is refused).
      if (day === START) {
        setClock(at(day, "15:00"));
        asUser(f.neli);
        const a = await completeWelcomeAction();
        const b = await completeWelcomeAction();
        if (!a.ok || a.next !== "/uvitani/pin") problems.push(`${day}: welcome should lead to the PIN page`);
        if (!b.ok) problems.push(`${day}: second welcome call failed`);
        const weak = await setOwnPinAction("0000", "0000");
        if (weak.ok) problems.push(`${day}: PIN 0000 should be refused`);
        const own = await setOwnPinAction("4821", "4821");
        if (!own.ok) problems.push(`${day}: own PIN refused`);
        const bonus = await db.creditTransaction.count({ where: { userId: f.neli.id, type: "WELCOME_BONUS" } });
        if (bonus !== 1) problems.push(`${day}: welcome bonus credited ${bonus}×`);
        const u = await db.user.findUnique({ where: { id: f.neli.id } });
        if (u?.pinIsTemporary || !u?.trialEndsOn) problems.push(`${day}: Neli should have own PIN and a trial end`);
      }

      // D24 absences, entered by parents.
      if (day === "2026-10-02") {
        setClock(at(day, "20:30"));
        asUser(f.milan);
        const r = await createAbsenceAction({ userIds: [f.neli.id], from: "2026-10-05", to: "2026-10-10", note: "tábor" });
        if (!r.ok) problems.push(`${day}: camp absence refused: ${r.error}`);
      }
      if (day === "2026-10-09") {
        setClock(at(day, "08:00"));
        asUser(f.milan);
        const camp = await db.absence.findFirst({ where: { userId: f.neli.id, note: "tábor" } });
        await endAbsenceAction(camp!.id);
        const back = await todayChecks(f.neli.id);
        if (back.length === 0) problems.push(`${day}: ending the camp should bring today's checks back`);
        log(day, `Neli back from camp early, ${back.length} checks today`);
      }
      if (day === "2026-10-15") {
        setClock(at(day, "07:30"));
        asUser(f.teri);
        const r = await createAbsenceAction({ userIds: [f.emi.id], from: "2026-10-14", to: "2026-10-14", note: "nemoc" });
        if (!r.ok) problems.push(`${day}: illness entered afterwards refused: ${r.error}`);
      }
      if (day === "2026-10-20") {
        setClock(at(day, "21:00"));
        asUser(f.teri);
        const r = await createAbsenceAction({ userIds: f.kids.map((k) => k.id), from: "2026-10-23", to: "2026-10-25", note: "chalupa" });
        if (!r.ok) problems.push(`${day}: family absence refused: ${r.error}`);
      }
      const away = await absentUserIds(at(day, "12:00"));
      const home = (k: Family["ani"]) => !away.has(k.id);

      // 16:30 Ani: everything on time, then a task.
      setClock(at(day, "16:30"));
      if (home(f.ani)) await submitAll(f.ani);
      const aniTask = home(f.ani) ? await tryClaim(f.ani) : null;
      if (aniTask) log(day, `Ani claimed ${aniTask.task.name}`);

      // 18:00 Neli: checks, then Půdička sometimes; spends on screen time.
      setClock(at(day, "18:00"));
      if (home(f.neli) && day !== "2026-10-01") await submitAll(f.neli);
      else if (day === "2026-10-01") log(day, "Neli forgets her checks (trial week)");
      const neliTask = home(f.neli) ? await tryClaim(f.neli, "Půdička") : null;
      if (i % 2 === 0 && home(f.neli)) {
        asUser(f.neli);
        const r = await requestScreenTimeAction(30);
        log(day, `Neli asks 30 min → ${r.ok ? "ok" : (r as { error: string }).error}`);
      }

      // 17:30 / 19:00 reports (Neli once lets her task expire).
      setClock(at(day, "19:00"));
      await reportMine(f.ani);
      if (neliTask && i !== 16) await reportMine(f.neli);
      else if (neliTask) log(day, "Neli lets Půdička expire");

      // D28 19:30: evening reminder only to whoever still has something open (Emi sends at 20:00).
      const evening = await runReminders(day, "19:30");
      const evened = new Set(evening.flatMap((p) => p.userIds));
      if (evened.has(f.ani.id)) problems.push(`${day}: Ani sent everything at 16:30 but got an evening reminder`);
      if (home(f.emi) && !evened.has(f.emi.id)) problems.push(`${day}: Emi had everything open at 19:30 but no reminder`);
      if (!home(f.emi) && evened.has(f.emi.id)) problems.push(`${day}: Emi is away but got a reminder`);
      if (day === "2026-10-01" && !evened.has(f.neli.id)) problems.push(`${day}: Neli forgot her checks but got no reminder`);

      // 20:00 Emi: forgets everything on Wednesdays; takes a task on Saturdays.
      setClock(at(day, "20:00"));
      if (dow !== 3 && home(f.emi)) await submitAll(f.emi);
      else if (home(f.emi)) log(day, "Emi forgets her checks");
      if (dow === 6 && home(f.emi)) {
        const t = await tryClaim(f.emi);
        if (t) {
          setClock(at(day, "20:40"));
          await reportMine(f.emi);
        }
      }

      // D28 20:05: parents' e-mail about unsent checks — only for kids with something open, once.
      setClock(at(day, "20:05"));
      await cron("reminders");
      await cron("reminders");
      const mailed = await db.reminderLog.findMany({
        where: { date: startOfDayPrague(), key: "parents-email" },
        select: { userId: true },
      });
      const mailedIds = new Set(mailed.map((m) => m.userId));
      const mails = emails.filter((e) => e.subject.includes("neodesláno"));
      if (mailedIds.size > 0 && mails.length === 0) {
        problems.push(`${day}: unsent checks logged but no e-mail`);
      }
      if (mailedIds.has(f.ani.id)) problems.push(`${day}: parents' e-mail lists Ani, who sent everything`);
      if (dow === 3 && home(f.emi) && !mailedIds.has(f.emi.id)) problems.push(`${day}: parents' e-mail misses Emi's forgotten checks`);

      // Saturday: parent records screen time Ani asked for verbally (D19).
      if (dow === 6 && home(f.ani)) {
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
      if (i === 15) {
        const c = (await todayChecks(f.neli.id)).find((x) => x.status === "SUBMITTED");
        if (c) {
          asUser(f.teri);
          const before = pushes.length;
          await rejectCheckAction(c.id, "drobky pod stolem");
          await flushAfter();
          const back = pushes.slice(before).find((p) => p.userIds.includes(f.neli.id));
          if (!back || back.message.badge !== 1) problems.push(`${day}: Neli got no push (or wrong number) for her returned check`);
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
      // D28 21:35 (doubled run): last chance only for kids who still have something open.
      const last = await runReminders(day, "21:35", true);
      const lastIds = new Set(last.flatMap((p) => p.userIds));
      if (dow === 3 && home(f.emi) && !lastIds.has(f.emi.id)) problems.push(`${day}: Emi forgot everything but got no last chance`);
      if (dow !== 3 && lastIds.has(f.emi.id)) problems.push(`${day}: Emi sent everything at 20:00 but got a last chance`);

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
        if (day === "2026-10-15" && r.ok) problems.push(`${day}: 14. 10. is an absence now, nothing to excuse`);
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
    // Days away (D24) neither count nor break: family 23.–25. 10.; Neli 5.–8. 10.; Emi 14. 10.
    if (ani.currentStreak !== DAYS - 3) problems.push(`end: Ani streak ${ani.currentStreak}, expected ${DAYS - 3}`);
    const neli = kids[2];
    // Neli: minus 1. 10. (failed in the trial week → skipped, not a break).
    if (neli.currentStreak !== DAYS - 3 - 4 - 1) problems.push(`end: Neli streak ${neli.currentStreak}, expected ${DAYS - 8}`);
    if (neli.brokenStreaksCount !== 0) problems.push(`end: Neli broke her streak ${neli.brokenStreaksCount}× (trial should protect 1. 10.)`);
    const aniTrophies = await db.trophyEarned.findMany({ where: { userId: ani.id }, include: { milestone: true } });
    const names = aniTrophies.map((t) => t.milestone.days).sort((a, b) => a - b);
    if (names.join(",") !== "7,14,30") problems.push(`end: Ani trophies ${names.join(",")}, expected 7,14,30`);
    // Emi missed every Wednesday; October ones were excused (D20), 30. 9. could not be (month closed).
    if (emi.currentStreak !== 32 - 3 - 1) problems.push(`end: Emi streak ${emi.currentStreak}, expected 28 (since 1. 10., minus days away)`);
    const sept30 = await db.dailyCheckInstance.findMany({ where: { userId: emi.id, date: startOfDayPrague(at("2026-09-30", "12:00")) } });
    if (!sept30.length || sept30.some((c) => c.status !== "MISSED")) problems.push("end: Emi's 30. 9. should stay MISSED");
    const pending = await db.dailyCheckInstance.count({ where: { status: "PENDING", date: { lt: startOfDayPrague() } } });
    if (pending) problems.push(`end: ${pending} past check(s) left PENDING`);
    // D24: nothing for anyone while away; no new offers while the whole family is away.
    for (const a of await db.absence.findMany()) {
      const open = await db.dailyCheckInstance.count({
        where: { userId: a.userId, date: { gte: a.fromDate, lte: a.toDate }, status: { in: ["PENDING", "MISSED", "REJECTED"] } },
      });
      if (open) problems.push(`end: ${open} open/missed check(s) during an absence (${a.note})`);
      const claimed = await db.taskInstance.count({
        where: { claimedById: a.userId, claimedAt: { gte: a.fromDate, lt: new Date(a.toDate.getTime() + 86_400_000) } },
      });
      if (claimed) problems.push(`end: a task was claimed during an absence (${a.note})`);
    }
    const offersWhileAway = await db.taskInstance.count({
      where: { createdAt: { gte: at("2026-10-23", "00:00"), lt: at("2026-10-26", "00:00") } },
    });
    if (offersWhileAway) problems.push(`end: ${offersWhileAway} task offer(s) created while the whole family was away`);
    // D28: every submitted check / task / screen time request pushed the parents.
    await flushAfter();
    const unsentMails = emails.filter((e) => e.subject.includes("neodesláno")).length;
    const mailDays = (await db.reminderLog.findMany({ where: { key: "parents-email" }, distinct: ["date"] })).length;
    if (unsentMails !== mailDays) problems.push(`end: ${unsentMails} unsent e-mails for ${mailDays} days with something open`);
    const approvalPushes = pushes.filter((p) => p.message.tag === "approvals");
    const queued = await db.notificationQueue.count();
    if (approvalPushes.length !== queued) problems.push(`end: ${approvalPushes.length} approval pushes for ${queued} queued events`);
    if (approvalPushes.some((p) => p.userIds.sort().join() !== [f.milan.id, f.teri.id].sort().join())) {
      problems.push("end: an approval push did not go to both parents");
    }
    events.push(`end pushes: ${pushes.filter((p) => p.message.tag === "reminder").length} reminders, ${approvalPushes.length} approval pushes`);

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
