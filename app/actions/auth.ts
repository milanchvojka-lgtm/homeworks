"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  clearAttempts,
  createSession,
  destroySession,
  isLockedOut,
  recordFailedAttempt,
  verifyPin,
} from "@/lib/auth";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "locked" | "not_found" };

export async function loginAction(
  userId: string,
  pin: string,
): Promise<LoginResult> {
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "invalid" };

  if (isLockedOut(userId)) return { ok: false, error: "locked" };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "not_found" };

  const valid = await verifyPin(pin, user.pinHash);
  if (!valid) {
    recordFailedAttempt(userId);
    if (isLockedOut(userId)) return { ok: false, error: "locked" };
    return { ok: false, error: "invalid" };
  }

  clearAttempts(userId);
  await createSession(user.id);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
