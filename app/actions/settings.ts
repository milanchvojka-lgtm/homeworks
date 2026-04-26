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
