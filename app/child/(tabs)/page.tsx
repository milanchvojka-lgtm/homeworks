import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentAssignment } from "@/lib/rotation";
import { startOfDayPrague } from "@/lib/time";
import { CheckCard, type CheckCardData } from "../_components/check-card";
import { TaskCard } from "../_components/task-card";
import { FreeDay } from "../_components/free-day";
import { DayProgress } from "../_components/day-progress";
import { currentAbsence } from "@/lib/absence";

/**
 * Dnes (návrh 2, frames 01A6, 01b, 01d): today's role with progress and check detail (D32, D33, pen HWD · 01A, 02B).
 * Only tasks the child must act on stay here (running, returned); sent and approved ones live in Vydělat.
 */
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
    db.taskInstance.findMany({
      where: { claimedById: user.id, status: { in: ["CLAIMED", "REJECTED"] } },
      include: { task: true },
      orderBy: { claimedAt: "asc" },
    }),
    currentAbsence(user.id),
  ]);
  const nowIso = new Date().toISOString();

  const checks: CheckCardData[] = instances
    // Stable order (deadline, then admin order), never by status: cards must not jump when sent.
    .sort(
      (a, b) =>
        (a.dailyCheck.dueTime ?? "23:59").localeCompare(
          b.dailyCheck.dueTime ?? "23:59",
        ) || a.dailyCheck.order - b.dailyCheck.order,
    )
    .map((i) => ({
      id: i.id,
      name: i.dailyCheck.name,
      description: i.dailyCheck.description,
      status: i.status,
      dueTime: i.dailyCheck.dueTime,
      note: i.note,
      submittedAt: i.submittedAt?.toISOString() ?? null,
      reviewerName: i.reviewer?.name ?? null,
    }));


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
            : "Dnes nemáš přiřazenou povinnost."}
        </p>
      ) : (
        <>
          <DayProgress role={assignment?.competency.name ?? "—"} statuses={checks.map((c) => c.status)} />
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
          {/* Claim order from the query, not status: cards must not jump when sent. */}
          {todayTasks.map((t) => (
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
