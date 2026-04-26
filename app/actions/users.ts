"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, hashPin, verifyPin } from "@/lib/auth";

const RESET_PIN = "0000";

export async function resetPinAction(
  userId: string,
): Promise<{ ok: true; tempPin: string } | { ok: false; error: string }> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") {
    return { ok: false, error: "forbidden" };
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "not_found" };

  const hash = await hashPin(RESET_PIN);
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { pinHash: hash } }),
    db.session.deleteMany({ where: { userId } }),
  ]);

  revalidatePath("/admin/uzivatele");
  return { ok: true, tempPin: RESET_PIN };
}

export async function changePinAction(
  oldPin: string,
  newPin: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };

  if (!/^\d{4}$/.test(newPin)) return { ok: false, error: "invalid_new_pin" };

  const fresh = await db.user.findUnique({ where: { id: user.id } });
  if (!fresh) return { ok: false, error: "not_found" };

  const ok = await verifyPin(oldPin, fresh.pinHash);
  if (!ok) return { ok: false, error: "wrong_pin" };

  const hash = await hashPin(newPin);
  await db.user.update({ where: { id: user.id }, data: { pinHash: hash } });

  return { ok: true };
}
