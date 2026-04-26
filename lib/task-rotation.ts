import "server-only";
import { db } from "./db";
import type { Prisma } from "@prisma/client";
import { nextRotationState, prioritizeChildren } from "./task-rotation-pure";
export { canUserClaim, prioritizeChildren } from "./task-rotation-pure";

/**
 * Vrátí ordered list child userIds pro nový TaskInstance.
 * Volitelný `excludeUserIds` pro skip po REJECTED.
 */
export async function buildRotationQueue(
  taskId: string,
  excludeUserIds: string[] = [],
): Promise<string[]> {
  const children = await db.user.findMany({
    where: {
      role: "CHILD",
      id: { notIn: excludeUserIds },
    },
    orderBy: { rotationOrder: "asc" },
  });

  const lastByUser = new Map<string, Date>();
  const logs = await db.taskRotationLog.findMany({
    where: { taskId, userId: { in: children.map((c) => c.id) } },
    orderBy: { doneAt: "desc" },
  });
  for (const l of logs) {
    if (!lastByUser.has(l.userId)) lastByUser.set(l.userId, l.doneAt);
  }

  return prioritizeChildren(children, lastByUser);
}

/** Vytvoří novou TaskInstance s rotation queue a unlocked pro prvního v pořadí. */
export async function createTaskInstance(
  taskId: string,
  options: {
    excludeUserIds?: string[];
    expiresAt?: Date;
  } = {},
) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("task_not_found");

  const queue = await buildRotationQueue(taskId, options.excludeUserIds ?? []);
  const now = new Date();
  const claimMs = task.claimTimeoutHours * 60 * 60 * 1000;

  // Celkový deadline: claim timeout × (počet kroků v rotaci + 1 open phase)
  const expiresAt =
    options.expiresAt ?? new Date(now.getTime() + claimMs * (queue.length + 1));

  const unlockedForUserId = queue[0] ?? null;
  const unlockExpiresAt = unlockedForUserId
    ? new Date(now.getTime() + claimMs)
    : new Date(now.getTime() + claimMs);

  return db.taskInstance.create({
    data: {
      taskId,
      status: "AVAILABLE",
      expiresAt,
      rotationQueue: queue as Prisma.InputJsonValue,
      rotationIndex: 0,
      unlockedForUserId,
      unlockExpiresAt,
    },
  });
}

/**
 * Posune rotaci o krok dál. Pokud projeli všichni, přepne do open phase
 * (`unlockedForUserId = null`). Pokud i open phase prošla, EXPIRED.
 */
export async function shiftRotation(instanceId: string) {
  const inst = await db.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });
  if (!inst) return;
  if (inst.status !== "AVAILABLE") return;

  const queue = (inst.rotationQueue as unknown as string[]) ?? [];
  const next = nextRotationState(
    { rotationIndex: inst.rotationIndex, queueLength: queue.length },
    new Date(),
    inst.task.claimTimeoutHours * 60 * 60 * 1000,
  );

  if (next.kind === "expired") {
    await db.taskInstance.update({
      where: { id: instanceId },
      data: {
        status: "EXPIRED",
        unlockedForUserId: null,
        unlockExpiresAt: null,
      },
    });
    return;
  }

  await db.taskInstance.update({
    where: { id: instanceId },
    data: {
      rotationIndex: next.rotationIndex,
      unlockedForUserId: next.kind === "open" ? null : queue[next.rotationIndex],
      unlockExpiresAt: next.unlockExpiresAt,
    },
  });
}

/** True, pokud daný uživatel má dnes všechny denní checky SUBMITTED nebo APPROVED. */
export async function hasCompletedTodayChecks(
  userId: string,
  date: Date,
): Promise<boolean> {
  const instances = await db.dailyCheckInstance.findMany({
    where: { userId, date },
    select: { status: true },
  });
  if (instances.length === 0) return true; // žádné checky → nic neblokuje
  return instances.every(
    (i) => i.status === "SUBMITTED" || i.status === "APPROVED",
  );
}

