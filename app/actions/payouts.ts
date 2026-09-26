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

  // Conditional update in the transaction: the other parent marking it at the same time must not deduct twice.
  const paid = await db.$transaction(async (tx) => {
    const updated = await tx.weeklyPayout.updateMany({
      where: { id: payoutId, paidOutAt: null },
      data: { paidOutAt: new Date(), paidOutById: user.id },
    });
    if (updated.count === 0) return false;
    await tx.creditTransaction.create({
      data: {
        userId: payout.userId,
        amountCzk: -payout.totalPayoutCzk,
        type: "PAYOUT",
        referenceId: payoutId,
        weekStart: payout.weekStart,
        note: `Hotovostní výplata`,
      },
    });
    return true;
  });
  if (!paid) return { ok: false, error: "already_paid" };

  revalidatePath("/admin", "layout");
  revalidatePath("/child", "layout");
  return { ok: true };
}
