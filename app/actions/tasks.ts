"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enqueueNotification } from "@/lib/notifications";
import {
  canUserClaim,
  createTaskInstance,
  hasCompletedTodayChecks,
} from "@/lib/task-rotation";
import { startOfDayPrague, startOfWeekPrague } from "@/lib/time";

export type TaskActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export async function createTaskAction(input: {
  name: string;
  description: string | null;
  valueCzk: number;
  timeEstimateMinutes: number | null;
  frequencyDays: number | null;
  claimTimeoutHours: number;
  executeTimeoutHours: number;
}): Promise<{ ok: true; taskId: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();

  if (!input.name.trim()) return { ok: false, error: "name_required" };
  if (input.valueCzk < 0) return { ok: false, error: "invalid_value" };

  const task = await db.task.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      valueCzk: input.valueCzk,
      timeEstimateMinutes: input.timeEstimateMinutes,
      frequencyDays: input.frequencyDays,
      claimTimeoutHours: input.claimTimeoutHours,
      executeTimeoutHours: input.executeTimeoutHours,
      createdById: admin.id,
    },
  });

  // První instance hned (ad hoc i recurring).
  await createTaskInstance(task.id);

  revalidatePath("/admin/ukoly");
  revalidatePath("/child/pool");
  return { ok: true, taskId: task.id };
}

export async function updateTaskAction(
  id: string,
  input: {
    name: string;
    description: string | null;
    valueCzk: number;
    timeEstimateMinutes: number | null;
    frequencyDays: number | null;
    claimTimeoutHours: number;
    executeTimeoutHours: number;
    isActive: boolean;
  },
): Promise<TaskActionResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "name_required" };

  await db.task.update({
    where: { id },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      valueCzk: input.valueCzk,
      timeEstimateMinutes: input.timeEstimateMinutes,
      frequencyDays: input.frequencyDays,
      claimTimeoutHours: input.claimTimeoutHours,
      executeTimeoutHours: input.executeTimeoutHours,
      isActive: input.isActive,
    },
  });
  revalidatePath("/admin/ukoly");
  return { ok: true };
}

export async function claimTaskAction(
  instanceId: string,
): Promise<TaskActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "CHILD") return { ok: false, error: "forbidden" };

  const inst = await db.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });
  if (!inst) return { ok: false, error: "not_found" };
  if (!canUserClaim(inst, user.id)) {
    return { ok: false, error: "not_unlocked" };
  }

  const today = startOfDayPrague();
  const ok = await hasCompletedTodayChecks(user.id, today);
  if (!ok) return { ok: false, error: "daily_checks_pending" };

  const now = new Date();
  const executeDeadline = new Date(
    now.getTime() + inst.task.executeTimeoutHours * 60 * 60 * 1000,
  );

  // Atomický claim: jen pokud status pořád AVAILABLE.
  const updated = await db.taskInstance.updateMany({
    where: { id: instanceId, status: "AVAILABLE" },
    data: {
      status: "CLAIMED",
      claimedById: user.id,
      claimedAt: now,
      executeDeadline,
    },
  });
  if (updated.count === 0) return { ok: false, error: "race" };

  revalidatePath("/child/pool");
  revalidatePath("/child/me-ukoly");
  return { ok: true };
}

export async function reportTaskDoneAction(
  instanceId: string,
): Promise<TaskActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "unauthorized" };
  if (user.role !== "CHILD") return { ok: false, error: "forbidden" };

  const inst = await db.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });
  if (!inst) return { ok: false, error: "not_found" };
  if (inst.claimedById !== user.id) return { ok: false, error: "forbidden" };
  if (inst.status !== "CLAIMED") return { ok: false, error: "invalid_state" };

  await db.taskInstance.update({
    where: { id: instanceId },
    data: { status: "PENDING_REVIEW", submittedAt: new Date() },
  });

  await enqueueNotification("TASK_PENDING_REVIEW", {
    userId: user.id,
    userName: user.name,
    taskName: inst.task.name,
    valueCzk: inst.task.valueCzk,
  });

  revalidatePath("/child/me-ukoly");
  revalidatePath("/admin");
  return { ok: true };
}

export async function approveTaskAction(
  instanceId: string,
): Promise<TaskActionResult> {
  const admin = await requireAdmin();

  const inst = await db.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });
  if (!inst) return { ok: false, error: "not_found" };
  if (inst.status !== "PENDING_REVIEW") {
    return { ok: false, error: "invalid_state" };
  }
  if (!inst.claimedById) return { ok: false, error: "no_claimer" };

  const claimerId = inst.claimedById;
  const weekStart = startOfWeekPrague();

  await db.$transaction([
    db.taskInstance.update({
      where: { id: instanceId },
      data: {
        status: "DONE",
        reviewedAt: new Date(),
        reviewerId: admin.id,
      },
    }),
    db.taskRotationLog.create({
      data: { taskId: inst.taskId, userId: claimerId },
    }),
    db.creditTransaction.create({
      data: {
        userId: claimerId,
        amountCzk: inst.task.valueCzk,
        type: "TASK_REWARD",
        referenceId: instanceId,
        weekStart,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/child/me-ukoly");
  revalidatePath("/child/kredit");
  return { ok: true };
}

export async function rejectTaskAction(
  instanceId: string,
  note: string,
): Promise<TaskActionResult> {
  const admin = await requireAdmin();

  const inst = await db.taskInstance.findUnique({
    where: { id: instanceId },
  });
  if (!inst) return { ok: false, error: "not_found" };
  if (inst.status !== "PENDING_REVIEW") {
    return { ok: false, error: "invalid_state" };
  }
  if (!inst.claimedById) return { ok: false, error: "no_claimer" };

  await db.taskInstance.update({
    where: { id: instanceId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewerId: admin.id,
      reviewNote: note.trim() || null,
    },
  });

  // Vytvoří se nová instance s rotací, která vynechá toho, kdo zfušoval.
  await createTaskInstance(inst.taskId, {
    excludeUserIds: [inst.claimedById],
  });

  revalidatePath("/admin");
  revalidatePath("/child/pool");
  revalidatePath("/child/me-ukoly");
  return { ok: true };
}
