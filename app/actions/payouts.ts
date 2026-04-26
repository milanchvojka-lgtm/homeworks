"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function markPayoutPaidAction(
  payoutId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const payout = await db.weeklyPayout.findUnique({ where: { id: payoutId } });
  if (!payout) return { ok: false, error: "not_found" };
  if (payout.paidOutAt) return { ok: false, error: "already_paid" };

  await db.$transaction([
    db.weeklyPayout.update({
      where: { id: payoutId },
      data: { paidOutAt: new Date(), paidOutById: user.id },
    }),
    db.creditTransaction.create({
      data: {
        userId: payout.userId,
        amountCzk: -payout.totalPayoutCzk,
        type: "PAYOUT",
        referenceId: payoutId,
        weekStart: payout.weekStart,
        note: `Hotovostní výplata`,
      },
    }),
  ]);

  revalidatePath("/admin/vyplaty");
  revalidatePath("/child/kredit");
  revalidatePath("/child/historie");
  return { ok: true };
}
