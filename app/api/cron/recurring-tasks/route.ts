import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { createTaskInstance } from "@/lib/task-rotation";

/**
 * Volá GitHub Actions denně 06:00 Prague.
 * Pro každý aktivní `Task` s `frequencyDays != null`:
 *   - Pokud existuje aktivní (non-terminal) instance → skip.
 *   - Jinak najdi poslední terminal instanci. Pokud `frequencyDays` od ní uplynulo,
 *     vytvoř novou. Pokud terminal instanci nemá vůbec, taky vytvoř novou.
 */
const TERMINAL = ["DONE", "EXPIRED", "REJECTED"] as const;
const ACTIVE = ["AVAILABLE", "CLAIMED", "PENDING_REVIEW"] as const;

export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const now = new Date();
  const tasks = await db.task.findMany({
    where: { isActive: true, frequencyDays: { not: null } },
  });

  let created = 0;
  let skipped = 0;

  for (const t of tasks) {
    const hasActive = await db.taskInstance.findFirst({
      where: { taskId: t.id, status: { in: [...ACTIVE] } },
      select: { id: true },
    });
    if (hasActive) {
      skipped++;
      continue;
    }

    const lastTerminal = await db.taskInstance.findFirst({
      where: { taskId: t.id, status: { in: [...TERMINAL] } },
      orderBy: { updatedAt: "desc" },
    });

    if (lastTerminal && t.frequencyDays) {
      const ageMs = now.getTime() - lastTerminal.updatedAt.getTime();
      const requiredMs = t.frequencyDays * 24 * 60 * 60 * 1000;
      if (ageMs < requiredMs) {
        skipped++;
        continue;
      }
    }

    await createTaskInstance(t.id);
    created++;
  }

  return NextResponse.json(
    { status: "ok", created, skipped },
    { headers: { "cache-control": "no-store" } },
  );
}
