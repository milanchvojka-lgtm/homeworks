"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enqueueNotification } from "@/lib/notifications";
import { sendPush } from "@/lib/push";
import { openChecksToday } from "@/lib/reminders";
import { rejectedCheckMessage } from "@/lib/reminders-pure";
import { dayResult } from "@/lib/streak";
import { withStreakResync } from "@/lib/streak-sync";
import { startOfDayPrague, startOfMonthPrague, startOfWeekPrague } from "@/lib/time";

export type CheckActionResult = { ok: true } | { ok: false; error: string };

export async function submitCheckAction(
  instanceId: string,
): Promise<CheckActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "CHILD") return { ok: false, error: "forbidden" };

  const instance = await db.dailyCheckInstance.findUnique({
    where: { id: instanceId },
    include: { dailyCheck: { include: { competency: true } } },
  });
  if (!instance) return { ok: false, error: "not_found" };
  if (instance.userId !== user.id) return { ok: false, error: "forbidden" };
  if (instance.status !== "PENDING" && instance.status !== "REJECTED") {
    return { ok: false, error: "invalid_state" };
  }

  await db.dailyCheckInstance.update({
    where: { id: instanceId },
    data: { status: "SUBMITTED", submittedAt: new Date(), note: null },
  });

  await enqueueNotification("CHECK_SUBMITTED", {
    userId: user.id,
    userName: user.name,
    checkName: instance.dailyCheck.name,
    competencyName: instance.dailyCheck.competency.name,
  });

  revalidatePath("/child", "layout");
  revalidatePath("/admin");
  return { ok: true };
}

export async function approveCheckAction(
  instanceId: string,
): Promise<CheckActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const instance = await db.dailyCheckInstance.findUnique({
    where: { id: instanceId },
  });
  if (!instance) return { ok: false, error: "not_found" };
  if (instance.status !== "SUBMITTED") {
    return { ok: false, error: "invalid_state" };
  }

  // Conditional update: the other parent may have handled it in the meantime.
  const updated = await db.dailyCheckInstance.updateMany({
    where: { id: instanceId, status: "SUBMITTED" },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewerId: user.id,
    },
  });
  if (updated.count === 0) return { ok: false, error: "invalid_state" };

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
  return { ok: true };
}

export async function rejectCheckAction(
  instanceId: string,
  note: string,
): Promise<CheckActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const instance = await db.dailyCheckInstance.findUnique({
    where: { id: instanceId },
    include: { dailyCheck: { select: { name: true } } },
  });
  if (!instance) return { ok: false, error: "not_found" };
  if (instance.status !== "SUBMITTED") {
    return { ok: false, error: "invalid_state" };
  }

  const updated = await db.dailyCheckInstance.updateMany({
    where: { id: instanceId, status: "SUBMITTED" },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewerId: user.id,
      note: note.trim() || null,
    },
  });
  if (updated.count === 0) return { ok: false, error: "invalid_state" };

  // D28: something is open again for the child — tell them now (a past day's check only closes, no push).
  if (instance.date.getTime() === startOfDayPrague().getTime()) {
    after(async () => {
      try {
        const open = await openChecksToday(instance.userId);
        await sendPush([instance.userId], rejectedCheckMessage(instance.dailyCheck.name, note.trim() || null, open.length));
      } catch (err) {
        console.error("push: returned check push failed", err);
      }
    });
  }

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
  return { ok: true };
}

/**
 * D20: a parent excuses a failed day of the running week. Its MISSED/REJECTED checks become APPROVED,
 * the streak is replayed from history (breaks and longest adjusted) and trophies the new streak reaches
 * are granted like in daily-close. The monthly bonus follows by itself (it counts failed instances).
 */
export async function excuseDayAction(
  userId: string,
  dayIso: string,
): Promise<CheckActionResult> {
  const admin = await getSession();
  if (!admin) return { ok: false, error: "unauthorized" };
  if (admin.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const now = new Date();
  const day = startOfDayPrague(new Date(dayIso));
  const today = startOfDayPrague(now);
  if (day < startOfWeekPrague(now) || day >= today) return { ok: false, error: "out_of_window" };
  if (startOfMonthPrague(day).getTime() !== startOfMonthPrague(now).getTime()) {
    return { ok: false, error: "month_closed" };
  }

  const done = await db.$transaction(async (tx) => {
    const child = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!child || child.role !== "CHILD") return "not_found" as const;

    const statuses = await tx.dailyCheckInstance.findMany({
      where: { userId, date: day },
      select: { status: true },
    });
    if (statuses.length === 0 || dayResult(statuses.map((x) => x.status)) === "OK") {
      return "invalid_state" as const;
    }

    await withStreakResync(tx, userId, async () => {
      await tx.dailyCheckInstance.updateMany({
        where: { userId, date: day, status: { in: ["MISSED", "REJECTED"] } },
        data: { status: "APPROVED", reviewedAt: now, reviewerId: admin.id, note: "Uznáno zpětně" },
      });
    });
    return "ok" as const;
  });
  if (done !== "ok") return { ok: false, error: done };

  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}
