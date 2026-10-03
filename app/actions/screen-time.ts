"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeScreenTimeCost, getAppSettings, isScreenRecordMinutes } from "@/lib/credit";
import { sendPush } from "@/lib/push";
import { openChecksToday } from "@/lib/reminders";
import { screenCancelledMessage, screenRecordedMessage, type PushMessage } from "@/lib/reminders-pure";
import { startOfDayPrague, startOfWeekPrague } from "@/lib/time";

export type ScreenTimeResult =
  | { ok: true }
  | { ok: false; error: string };

/** A failed push must never break the record (D28). */
function pushChild(userId: string, message: (openCount: number) => PushMessage) {
  after(async () => {
    try {
      const open = await openChecksToday(userId);
      await sendPush([userId], message(open.length));
    } catch (err) {
      console.error("push: screen time push failed", err);
    }
  });
}

/**
 * D30: screen time is asked for and approved in iOS; the parent only records it here.
 * 15 min or 1 h, never blocked by credit (the time was already given) — credit may go negative.
 */
export async function recordScreenTimeAction(
  userId: string,
  minutes: number,
): Promise<ScreenTimeResult> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }
  if (!isScreenRecordMinutes(minutes)) return { ok: false, error: "invalid_minutes" };

  const child = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!child || child.role !== "CHILD") return { ok: false, error: "not_found" };

  const settings = await getAppSettings();
  const cost = computeScreenTimeCost(minutes, settings.screenTimeHourCostCzk);

  const now = new Date();
  await db.$transaction(async (tx) => {
    const req = await tx.screenTimeRequest.create({
      data: {
        userId,
        minutes,
        costCzk: cost,
        status: "APPROVED",
        reviewedAt: now,
        reviewerId: admin.id,
      },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amountCzk: -cost,
        type: "SCREEN_TIME",
        referenceId: req.id,
        weekStart: startOfWeekPrague(now),
        note: `${minutes} min`,
      },
    });
  });

  pushChild(userId, (open) => screenRecordedMessage(minutes, cost, open));
  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}

/**
 * D30: undo a mistaken record — only today's, so no closed week or payout is touched.
 * The deduction is deleted, the record stays as REJECTED for the trail.
 */
export async function cancelScreenTimeAction(requestId: string): Promise<ScreenTimeResult> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const req = await db.screenTimeRequest.findUnique({ where: { id: requestId } });
  if (!req || req.status !== "APPROVED") return { ok: false, error: "not_found" };
  if ((req.reviewedAt ?? req.createdAt) < startOfDayPrague()) {
    return { ok: false, error: "not_today" };
  }

  const cancelled = await db.$transaction(async (tx) => {
    const updated = await tx.screenTimeRequest.updateMany({
      where: { id: requestId, status: "APPROVED" },
      data: { status: "REJECTED", reviewerId: admin.id },
    });
    if (updated.count === 0) return false;
    await tx.creditTransaction.deleteMany({
      where: { referenceId: requestId, type: "SCREEN_TIME" },
    });
    return true;
  });
  if (!cancelled) return { ok: false, error: "not_found" };

  pushChild(req.userId, (open) => screenCancelledMessage(req.minutes, req.costCzk, open));
  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}
