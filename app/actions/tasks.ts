"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enqueueNotification } from "@/lib/notifications";
import {
  canUserClaim,
  createTaskInstance,
  hasCompletedTodayChecks,
} from "@/lib/task-rotation";
import { absentUserIds } from "@/lib/absence";
import { sendPush } from "@/lib/push";
import { openChecksToday } from "@/lib/reminders";
import { taskDoneByParentMessage } from "@/lib/reminders-pure";
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
  revalidatePath("/child", "layout");
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

  // D24: a child who is away today does not take tasks.
  if ((await absentUserIds()).has(user.id)) return { ok: false, error: "away" };

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

  revalidatePath("/child", "layout");
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

  revalidatePath("/child", "layout");
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

  // Status change and reward in one transaction; the conditional update stops a second
  // parent's concurrent approval from paying the reward twice.
  const approved = await db.$transaction(async (tx) => {
    const updated = await tx.taskInstance.updateMany({
      where: { id: instanceId, status: "PENDING_REVIEW" },
      data: {
        status: "DONE",
        reviewedAt: new Date(),
        reviewerId: admin.id,
      },
    });
    if (updated.count === 0) return false;
    await tx.taskRotationLog.create({
      data: { taskId: inst.taskId, userId: claimerId },
    });
    await tx.creditTransaction.create({
      data: {
        userId: claimerId,
        amountCzk: inst.task.valueCzk,
        type: "TASK_REWARD",
        referenceId: instanceId,
        weekStart,
      },
    });
    return true;
  });
  if (!approved) return { ok: false, error: "invalid_state" };

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
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

  const updated = await db.taskInstance.updateMany({
    where: { id: instanceId, status: "PENDING_REVIEW" },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewerId: admin.id,
      reviewNote: note.trim() || null,
    },
  });
  if (updated.count === 0) return { ok: false, error: "invalid_state" };

  // Vytvoří se nová instance s rotací, která vynechá toho, kdo zfušoval.
  await createTaskInstance(inst.taskId, {
    excludeUserIds: [inst.claimedById],
  });

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
  return { ok: true };
}

/**
 * D31: a parent did a task that is on offer or running themselves. Nobody gets paid, it leaves the
 * offer and is no longer the child's (`claimedById` cleared). A recurring task comes back after
 * `frequencyDays` as after any finished one. The child who had it running gets a push.
 */
export async function doTaskForChildAction(instanceId: string): Promise<TaskActionResult> {
  const admin = await requireAdmin();

  const inst = await db.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: { select: { name: true } } },
  });
  if (!inst) return { ok: false, error: "not_found" };
  if (inst.status !== "AVAILABLE" && inst.status !== "CLAIMED") return { ok: false, error: "invalid_state" };

  // Conditional update: the child may have reported it, or the other parent done it, in the meantime.
  const updated = await db.taskInstance.updateMany({
    where: { id: instanceId, status: inst.status, claimedById: inst.claimedById },
    data: { status: "DONE", reviewedAt: new Date(), reviewerId: admin.id, claimedById: null },
  });
  if (updated.count === 0) return { ok: false, error: "invalid_state" };

  const childId = inst.status === "CLAIMED" ? inst.claimedById : null;
  if (childId) {
    after(async () => {
      try {
        const open = await openChecksToday(childId);
        await sendPush([childId], taskDoneByParentMessage(inst.task.name, open.length));
      } catch (err) {
        console.error("push: task done by parent push failed", err);
      }
    });
  }

  revalidatePath("/admin");
  revalidatePath("/child", "layout");
  return { ok: true };
}
