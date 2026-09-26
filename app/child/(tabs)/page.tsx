import { redirect } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { CheckStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentAssignment } from "@/lib/rotation";
import { startOfDayPrague } from "@/lib/time";
import { CheckCard, type CheckCardData } from "../_components/check-card";
import { DayDone } from "../_components/day-done";
import { TaskCard } from "../_components/task-card";

const ORDER: Record<CheckStatus, number> = {
  REJECTED: 0,
  PENDING: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  MISSED: 4,
};

/** Dnes (návrh 2, frames 01A6, 01b, 01c, 01d). */
export default async function ChildToday() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const [assignment, instances, running] = await Promise.all([
    getCurrentAssignment(user.id),
    db.dailyCheckInstance.findMany({
      where: { userId: user.id, date: today },
      include: {
        dailyCheck: true,
        reviewer: { select: { name: true } },
      },
    }),
    db.taskInstance.findMany({
      where: { claimedById: user.id, status: "CLAIMED" },
      include: { task: true },
      orderBy: { executeDeadline: "asc" },
    }),
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

  const open = checks.filter((c) => c.status === "PENDING" || c.status === "REJECTED");
  const allSent = checks.length > 0 && open.length === 0;
  const waiting = checks.filter((c) => c.status === "SUBMITTED").length;

  const label = (
    <h2 className="font-mono text-xs font-bold tracking-[0.12em] uppercase">
      Kompetence: {assignment?.competency.name ?? "—"}
    </h2>
  );

  return (
    <div className="flex flex-col gap-3">
      {checks.length === 0 ? (
        <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
          {assignment
            ? "Na dnešek nemáš žádné povinnosti."
            : "Tento týden nemáš přiřazenou povinnost."}
        </p>
      ) : allSent ? (
        <>
          <DayDone waitingCount={waiting} />
          <details className="group">
            <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-1 text-[15px] font-semibold text-muted-foreground">
              <ChevronDown className="size-[18px] transition-transform group-open:rotate-180" />
              Ukázat dnešní povinnosti ({checks.length})
            </summary>
            <div className="mt-2 flex flex-col gap-3">
              {label}
              {checks.map((c) => (
                <CheckCard key={c.id} check={c} nowIso={nowIso} />
              ))}
            </div>
          </details>
        </>
      ) : (
        <>
          {label}
          {checks.map((c) => (
            <CheckCard key={c.id} check={c} nowIso={nowIso} />
          ))}
        </>
      )}

      {running.length > 0 && (
        <>
          <h2 className="mt-2 font-mono text-xs font-bold tracking-[0.12em] uppercase">
            Rozdělaný úkol
          </h2>
          {running.map((t) => (
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
