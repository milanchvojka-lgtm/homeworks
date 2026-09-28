"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, hashPin, verifyPin } from "@/lib/auth";
import { getAppSettings } from "@/lib/credit";
import { startOfDayPrague, startOfWeekPrague } from "@/lib/time";

export type WelcomeResult = { ok: true; next: string } | { ok: false; error: string };

/**
 * D25: the child finished (or skipped) the welcome. Once per child: starts the trial week
 * (today + 6 days) and credits the welcome bonus. Next stop: own PIN if it is still temporary.
 */
export async function completeWelcomeAction(): Promise<WelcomeResult> {
  const user = await getSession();
  if (!user || user.role !== "CHILD") return { ok: false, error: "forbidden" };

  const now = new Date();
  const today = startOfDayPrague(now);
  // Noon offset keeps the day right across a DST change within the week.
  const trialEndsOn = startOfDayPrague(new Date(today.getTime() + 6 * 86_400_000 + 12 * 3600_000));
  const settings = await getAppSettings();

  await db.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: user.id, onboardedAt: null },
      data: { onboardedAt: now, trialEndsOn },
    });
    if (updated.count === 0 || settings.welcomeBonusCzk <= 0) return;
    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        amountCzk: settings.welcomeBonusCzk,
        type: "WELCOME_BONUS",
        weekStart: startOfWeekPrague(now),
        note: "Vstupní bonus",
      },
    });
  });

  revalidatePath("/child", "layout");
  const fresh = await db.user.findUnique({ where: { id: user.id }, select: { pinIsTemporary: true } });
  return { ok: true, next: fresh?.pinIsTemporary ? "/uvitani/pin" : "/child" };
}

/** D25: the child replaces the parent-set temporary PIN with their own (4 digits, not 0000). */
export async function setOwnPinAction(pin: string, again: string): Promise<WelcomeResult> {
  const user = await getSession();
  if (!user || user.role !== "CHILD") return { ok: false, error: "forbidden" };

  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "invalid_pin" };
  if (pin !== again) return { ok: false, error: "mismatch" };
  if (pin === "0000") return { ok: false, error: "too_simple" };

  const fresh = await db.user.findUnique({ where: { id: user.id }, select: { pinHash: true } });
  if (!fresh) return { ok: false, error: "not_found" };
  if (await verifyPin(pin, fresh.pinHash)) return { ok: false, error: "same_as_temporary" };

  await db.user.update({
    where: { id: user.id },
    data: { pinHash: await hashPin(pin), pinIsTemporary: false },
  });
  revalidatePath("/child", "layout");
  return { ok: true, next: "/child" };
}
