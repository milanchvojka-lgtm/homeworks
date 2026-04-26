"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enqueueNotification } from "@/lib/notifications";

export type CheckActionResult = { ok: true } | { ok: false; error: string };

export async function submitCheckAction(
  instanceId: string,
): Promise<CheckActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "CHILD") return { ok: false, error: "forbidden" };

  const instance = await db.dailyCheckInstance.findUnique({
    where: { id: instanceId },
    include: { dailyCheck: { include: { competency: true } } },
  });
  if (!instance) return { ok: false, error: "not_found" };
  if (instance.userId !== user.id) return { ok: false, error: "forbidden" };
  if (instance.status !== "PENDING" && instance.status !== "REJECTED") {
    return { ok: false, error: "invalid_state" };
  }

  await db.dailyCheckInstance.update({
    where: { id: instanceId },
    data: { status: "SUBMITTED", submittedAt: new Date(), note: null },
  });

  await enqueueNotification("CHECK_SUBMITTED", {
    userId: user.id,
    userName: user.name,
    checkName: instance.dailyCheck.name,
    competencyName: instance.dailyCheck.competency.name,
  });

  revalidatePath("/child");
  revalidatePath("/admin");
  return { ok: true };
}

export async function approveCheckAction(
  instanceId: string,
): Promise<CheckActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const instance = await db.dailyCheckInstance.findUnique({
    where: { id: instanceId },
  });
  if (!instance) return { ok: false, error: "not_found" };
  if (instance.status !== "SUBMITTED") {
    return { ok: false, error: "invalid_state" };
  }

  await db.dailyCheckInstance.update({
    where: { id: instanceId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewerId: user.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/child");
  return { ok: true };
}

export async function rejectCheckAction(
  instanceId: string,
  note: string,
): Promise<CheckActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const instance = await db.dailyCheckInstance.findUnique({
    where: { id: instanceId },
  });
  if (!instance) return { ok: false, error: "not_found" };
  if (instance.status !== "SUBMITTED") {
    return { ok: false, error: "invalid_state" };
  }

  await db.dailyCheckInstance.update({
    where: { id: instanceId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewerId: user.id,
      note: note.trim() || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/child");
  return { ok: true };
}
