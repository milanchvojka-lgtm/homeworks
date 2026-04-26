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

  revalidatePath("/child/kredit");
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

  await db.$transaction([
    db.screenTimeRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewerId: user.id },
    }),
    db.creditTransaction.create({
      data: {
        userId: req.userId,
        amountCzk: -req.costCzk,
        type: "SCREEN_TIME",
        referenceId: id,
        weekStart,
        note: `${req.minutes} min`,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/child/kredit");
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

  await db.screenTimeRequest.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewerId: user.id },
  });

  revalidatePath("/admin");
  revalidatePath("/child/kredit");
  return { ok: true };
}
