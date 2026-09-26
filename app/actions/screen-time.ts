"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  computeScreenTimeCost,
  getAppSettings,
  getCurrentBalance,
  isValidScreenTimeMinutes,
} from "@/lib/credit";
import { enqueueNotification } from "@/lib/notifications";
import { startOfWeekPrague } from "@/lib/time";

export type ScreenTimeResult =
  | { ok: true }
  | { ok: false; error: string };

export async function requestScreenTimeAction(
  minutes: number,
): Promise<ScreenTimeResult> {
  const user = await getSession();
  if (!user || user.role !== "CHILD") {
    return { ok: false, error: "forbidden" };
  }

  const settings = await getAppSettings();
  if (!isValidScreenTimeMinutes(minutes, settings.screenTimeMinGranularity)) {
    return { ok: false, error: "invalid_minutes" };
  }

  const cost = computeScreenTimeCost(minutes, settings.screenTimeHourCostCzk);
  const balance = await getCurrentBalance(user.id);
  if (balance < cost) return { ok: false, error: "insufficient_credit" };

  await db.screenTimeRequest.create({
    data: { userId: user.id, minutes, costCzk: cost, status: "PENDING" },
  });

  await enqueueNotification("SCREEN_TIME_REQUESTED", {
    userId: user.id,
    userName: user.name,
    minutes,
    costCzk: cost,
  });

  revalidatePath("/child", "layout");
  revalidatePath("/admin");
  return { ok: true };
}

export async function approveScreenTimeAction(
  id: string,
): Promise<ScreenTimeResult> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const req = await db.screenTimeRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "not_found" };
  if (req.status !== "PENDING") {
    return { ok: false, error: "invalid_state" };
  }

  const weekStart = startOfWeekPrague();

  // Conditional update inside the transaction: a concurrent approval must not deduct twice.
  const approved = await db.$transaction(async (tx) => {
    const updated = await tx.screenTimeRequest.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewerId: user.id },
    });
    if (updated.count === 0) return false;
    await tx.creditTransaction.create({
      data: {
        userId: req.userId,
        amountCzk: -req.costCzk,
        type: "SCREEN_TIME",
        referenceId: id,
        weekStart,
        note: `${req.minutes} min`,
      },
    });
    return true;
  });
  if (!approved) return { ok: false, error: "invalid_state" };

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
  return { ok: true };
}

export async function rejectScreenTimeAction(
  id: string,
): Promise<ScreenTimeResult> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const req = await db.screenTimeRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "not_found" };
  if (req.status !== "PENDING") {
    return { ok: false, error: "invalid_state" };
  }

  const updated = await db.screenTimeRequest.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewerId: user.id },
  });
  if (updated.count === 0) return { ok: false, error: "invalid_state" };

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
  return { ok: true };
}

/** D19: a parent records screen time the child asked for outside the app. Same credit rule as a request. */
export async function recordScreenTimeAction(
  userId: string,
  minutes: number,
): Promise<ScreenTimeResult> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const child = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!child || child.role !== "CHILD") return { ok: false, error: "not_found" };

  const settings = await getAppSettings();
  if (!isValidScreenTimeMinutes(minutes, settings.screenTimeMinGranularity)) {
    return { ok: false, error: "invalid_minutes" };
  }

  const cost = computeScreenTimeCost(minutes, settings.screenTimeHourCostCzk);
  const balance = await getCurrentBalance(userId);
  if (balance < cost) return { ok: false, error: "insufficient_credit" };

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

  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}
