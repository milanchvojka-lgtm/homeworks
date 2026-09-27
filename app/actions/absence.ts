"use server";

import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkAbsenceRange } from "@/lib/absence-pure";
import { openDay } from "@/lib/day-open";
import { withStreakResync } from "@/lib/streak-sync";
import { PRAGUE_TZ, startOfDayPrague } from "@/lib/time";

export type AbsenceResult = { ok: true } | { ok: false; error: string };

/** "2026-10-05" (a Prague calendar day from the date picker) → startOfDayPrague of that day. */
function pragueDay(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  return startOfDayPrague(fromZonedTime(`${ymd}T12:00:00`, PRAGUE_TZ));
}

/**
 * D24: parent marks children away for whole days [from, to]. Their open checks in the range that
 * already exist (today, or back to Monday) are removed — what they did (SUBMITTED/APPROVED) stays —
 * and the streak is rebuilt if a closed day changed. Future days simply get no checks.
 */
export async function createAbsenceAction(input: {
  userIds: string[];
  from: string;
  to: string;
  note?: string;
}): Promise<AbsenceResult> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const from = pragueDay(input.from);
  const to = pragueDay(input.to);
  if (!from || !to) return { ok: false, error: "invalid_date" };
  if (input.userIds.length === 0) return { ok: false, error: "no_children" };
  const rangeError = checkAbsenceRange(from, to, new Date());
  if (rangeError) return { ok: false, error: rangeError };

  const kids = await db.user.findMany({
    where: { id: { in: input.userIds }, role: "CHILD" },
    select: { id: true },
  });
  if (kids.length !== input.userIds.length) return { ok: false, error: "not_found" };

  const note = input.note?.trim() || null;
  for (const k of kids) {
    await db.$transaction(async (tx) => {
      await tx.absence.create({
        data: { userId: k.id, fromDate: from, toDate: to, note, createdById: admin.id },
      });
      await withStreakResync(tx, k.id, async () => {
        await tx.dailyCheckInstance.deleteMany({
          where: {
            userId: k.id,
            date: { gte: from, lte: to },
            status: { in: ["PENDING", "REJECTED", "MISSED"] },
          },
        });
      });
    });
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}

/**
 * D24: cancel an upcoming absence, or end a running one — today and later are no longer "away".
 * Past days stay without checks (they cannot be created afterwards); today's come back at once.
 */
export async function endAbsenceAction(id: string): Promise<AbsenceResult> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const a = await db.absence.findUnique({ where: { id } });
  if (!a) return { ok: false, error: "not_found" };

  const today = startOfDayPrague();
  if (a.toDate < today) return { ok: false, error: "already_over" };
  if (a.fromDate >= today) {
    await db.absence.delete({ where: { id } });
  } else {
    const yesterday = startOfDayPrague(new Date(today.getTime() - 12 * 3600_000));
    await db.absence.update({ where: { id }, data: { toDate: yesterday } });
  }
  await openDay(new Date(), [a.userId]);

  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}
