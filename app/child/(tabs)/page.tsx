import { redirect } from "next/navigation";
import type { CheckStatus, TaskStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentAssignment } from "@/lib/rotation";
import { startOfDayPrague } from "@/lib/time";
import { CheckCard, type CheckCardData } from "../_components/check-card";
import { TaskCard } from "../_components/task-card";
import { FreeDay } from "../_components/free-day";
import { currentAbsence } from "@/lib/absence";

/** Dnešní úkoly: running first, then returned, waiting, approved. */
const TASK_ORDER: Partial<Record<TaskStatus, number>> = {
  CLAIMED: 0,
  REJECTED: 1,
  PENDING_REVIEW: 2,
  DONE: 3,
};

const ORDER: Record<CheckStatus, number> = {
  REJECTED: 0,
  PENDING: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  MISSED: 4,
};

/** Dnes (návrh 2, frames 01A6, 01b, 01d; HW2 · 01: checks stay as cards, today's tasks stay until the day ends). */
export default async function ChildToday() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const [assignment, instances, todayTasks, away] = await Promise.all([
    getCurrentAssignment(user.id),
    db.dailyCheckInstance.findMany({
      where: { userId: user.id, date: today },
      include: {
        dailyCheck: true,
        reviewer: { select: { name: true } },
      },
    }),
    // Taken today (any state), plus older ones still running or waiting.
    db.taskInstance.findMany({
      where: {
        claimedById: user.id,
        status: { in: ["CLAIMED", "PENDING_REVIEW", "REJECTED", "DONE"] },
        OR: [
          { status: { in: ["CLAIMED", "PENDING_REVIEW"] } },
          { claimedAt: { gte: today } },
          { reviewedAt: { gte: today } },
        ],
      },
      include: { task: true },
      orderBy: { claimedAt: "asc" },
    }),
    currentAbsence(user.id),
  ]);
  const nowIso = new Date().toISOString();

  const checks: CheckCardData[] = instances
    .sort(
      (a, b) =>
        ORDER[a.status] - ORDER[b.status] ||
        (a.dailyCheck.dueTime ?? "23:59").localeCompare(b.dailyCheck.dueTime ?? "23:59") ||
        a.dailyCheck.order - b.dailyCheck.order,
    )
    .map((i) => ({
      id: i.id,
      name: i.dailyCheck.name,
      status: i.status,
      dueTime: i.dailyCheck.dueTime,
      note: i.note,
      submittedAt: i.submittedAt?.toISOString() ?? null,
      reviewerName: i.reviewer?.name ?? null,
    }));

  const label = (
    <h2 className="font-mono text-xs font-bold tracking-[0.12em] uppercase">
      Kompetence: {assignment?.competency.name ?? "—"}
    </h2>
  );

  return (
    <div className="flex flex-col gap-3">
      {away ? (
        <>
          <FreeDay until={away.toDate} note={away.note} />
          {checks.map((c) => (
            <CheckCard key={c.id} check={c} nowIso={nowIso} />
          ))}
        </>
      ) : checks.length === 0 ? (
        <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
          {assignment
            ? "Na dnešek nemáš žádné povinnosti."
            : "Tento týden nemáš přiřazenou povinnost."}
        </p>
      ) : (
        <>
          {label}
          {checks.map((c) => (
            <CheckCard key={c.id} check={c} nowIso={nowIso} />
          ))}
        </>
      )}

      {todayTasks.length > 0 && (
        <>
          <h2 className="mt-2 font-mono text-xs font-bold tracking-[0.12em] uppercase">
            Dnešní úkoly
          </h2>
          {todayTasks
            .sort((a, b) => (TASK_ORDER[a.status] ?? 9) - (TASK_ORDER[b.status] ?? 9))
            .map((t) => (
            <TaskCard
              key={t.id}
              nowIso={nowIso}
              task={{
                id: t.id,
                name: t.task.name,
                valueCzk: t.task.valueCzk,
                timeEstimateMinutes: t.task.timeEstimateMinutes,
                status: t.status,
                executeDeadline: t.executeDeadline?.toISOString() ?? null,
                submittedAt: t.submittedAt?.toISOString() ?? null,
                reviewNote: t.reviewNote,
                lockedReason: null,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
