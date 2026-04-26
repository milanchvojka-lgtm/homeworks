import "server-only";
import { db } from "./db";
import type { Prisma } from "@prisma/client";

/**
 * Vrátí ordered list child userIds pro nový TaskInstance.
 * Pořadí: kdo dělal tento taskId nejdéle naposledy nahoře (z TaskRotationLog).
 * Kdo nikdy nedělal → priorita podle User.rotationOrder.
 *
 * Volitelný parametr `excludeUserIds` pro skip rotaci po REJECTED.
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

  return children
    .slice()
    .sort((a, b) => {
      const la = lastByUser.get(a.id);
      const lb = lastByUser.get(b.id);
      // Nikdy nedělal vyhrává nad těmi, kdo dělali nedávno.
      if (!la && !lb) return (a.rotationOrder ?? 0) - (b.rotationOrder ?? 0);
      if (!la) return -1;
      if (!lb) return 1;
      return la.getTime() - lb.getTime(); // starší naposledy = výš
    })
    .map((c) => c.id);
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
  const claimMs = inst.task.claimTimeoutHours * 60 * 60 * 1000;
  const now = new Date();
  const nextIndex = inst.rotationIndex + 1;

  if (nextIndex < queue.length) {
    await db.taskInstance.update({
      where: { id: instanceId },
      data: {
        rotationIndex: nextIndex,
        unlockedForUserId: queue[nextIndex],
        unlockExpiresAt: new Date(now.getTime() + claimMs),
      },
    });
    return;
  }

  if (nextIndex === queue.length) {
    // Open phase: kdokoliv si může vzít
    await db.taskInstance.update({
      where: { id: instanceId },
      data: {
        rotationIndex: nextIndex,
        unlockedForUserId: null,
        unlockExpiresAt: new Date(now.getTime() + claimMs),
      },
    });
    return;
  }

  // Po open phase → EXPIRED
  await db.taskInstance.update({
    where: { id: instanceId },
    data: { status: "EXPIRED", unlockedForUserId: null, unlockExpiresAt: null },
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

/** True, pokud uživatel může claimnout danou TaskInstance (bez blokujících podmínek). */
export function canUserClaim(
  inst: {
    status: string;
    unlockedForUserId: string | null;
  },
  userId: string,
): boolean {
  if (inst.status !== "AVAILABLE") return false;
  if (inst.unlockedForUserId === null) return true; // open phase
  return inst.unlockedForUserId === userId;
}
