"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getAppSettings } from "@/lib/credit";

export async function updateAppSettingsAction(input: {
  hourlyRateCzk: number;
  screenTimeHourCostCzk: number;
  screenTimeMinGranularity: number;
  monthlyBonusCzk: number;
  monthlyBonusStepCzk: number;
  defaultClaimTimeoutHours: number;
  defaultExecuteTimeoutHours: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  for (const v of Object.values(input)) {
    if (!Number.isFinite(v) || v < 0) {
      return { ok: false, error: "invalid_value" };
    }
  }

  const settings = await getAppSettings();
  await db.appSettings.update({ where: { id: settings.id }, data: input });

  revalidatePath("/admin/nastaveni");
  return { ok: true };
}

export async function createStreakMilestoneAction(input: {
  days: number;
  rewardCzk: number;
  trophyName: string;
  emoji: string;
  sortOrder: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  if (!Number.isFinite(input.days) || input.days <= 0) {
    return { ok: false, error: "invalid_days" };
  }
  if (!Number.isFinite(input.rewardCzk) || input.rewardCzk < 0) {
    return { ok: false, error: "invalid_reward" };
  }
  if (!input.trophyName.trim()) {
    return { ok: false, error: "empty_name" };
  }
  if (!input.emoji.trim()) {
    return { ok: false, error: "empty_emoji" };
  }

  try {
    await db.streakMilestone.create({ data: input });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { ok: false, error: "duplicate_days" };
    }
    return { ok: false, error: "db_error" };
  }

  revalidatePath("/admin/nastaveni");
  return { ok: true };
}

export async function updateStreakMilestoneAction(
  id: string,
  input: {
    days: number;
    rewardCzk: number;
    trophyName: string;
    emoji: string;
    sortOrder: number;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  if (!Number.isFinite(input.days) || input.days <= 0) {
    return { ok: false, error: "invalid_days" };
  }
  if (!Number.isFinite(input.rewardCzk) || input.rewardCzk < 0) {
    return { ok: false, error: "invalid_reward" };
  }
  if (!input.trophyName.trim()) {
    return { ok: false, error: "empty_name" };
  }
  if (!input.emoji.trim()) {
    return { ok: false, error: "empty_emoji" };
  }

  try {
    await db.streakMilestone.update({ where: { id }, data: input });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { ok: false, error: "duplicate_days" };
    }
    return { ok: false, error: "db_error" };
  }

  revalidatePath("/admin/nastaveni");
  return { ok: true };
}

export async function deleteStreakMilestoneAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  await db.streakMilestone.delete({ where: { id } });

  revalidatePath("/admin/nastaveni");
  return { ok: true };
}
