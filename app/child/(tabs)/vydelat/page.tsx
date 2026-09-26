import { redirect } from "next/navigation";
import type { TaskStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDayPrague } from "@/lib/time";
import { ChecksFirstBanner } from "../../_components/checks-first-banner";
import { formatTimePrague } from "../../_components/format";
import { TaskCard, type TaskCardData } from "../../_components/task-card";

const MINE_ORDER: Partial<Record<TaskStatus, number>> = {
  CLAIMED: 0,
  REJECTED: 1,
  PENDING_REVIEW: 2,
};

/** Vydělat = former Pool + Mé úkoly (návrh 2, frames 02c2, 02-2, 02b). */
export default async function ChildEarnPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const [checks, mine, available, children] = await Promise.all([
    db.dailyCheckInstance.findMany({
      where: { userId: user.id, date: today },
      include: { dailyCheck: { select: { name: true, dueTime: true, order: true } } },
    }),
    db.taskInstance.findMany({
      where: {
        claimedById: user.id,
        status: { in: ["CLAIMED", "PENDING_REVIEW", "REJECTED"] },
      },
      include: { task: true },
      orderBy: { claimedAt: "desc" },
    }),
    db.taskInstance.findMany({
      where: { status: "AVAILABLE" },
      include: { task: true },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findMany({ where: { role: "CHILD" }, select: { id: true, name: true } }),
  ]);
  const nowIso = new Date().toISOString();
  const names = new Map(children.map((c) => [c.id, c.name]));

  // Same rule as hasCompletedTodayChecks (claim precondition, D1): every check SUBMITTED or APPROVED.
  const sent = checks.filter((c) => c.status === "SUBMITTED" || c.status === "APPROVED");
  const checksOk = checks.length === 0 || sent.length === checks.length;
  const nextOpen = checks
    .filter((c) => c.status !== "SUBMITTED" && c.status !== "APPROVED")
    .sort((a, b) =>
      (a.dailyCheck.dueTime ?? "23:59").localeCompare(b.dailyCheck.dueTime ?? "23:59"),
    )[0];

  const mineCards: TaskCardData[] = mine
    .sort((a, b) => (MINE_ORDER[a.status] ?? 9) - (MINE_ORDER[b.status] ?? 9))
    .map((i) => ({
      id: i.id,
      name: i.task.name,
      valueCzk: i.task.valueCzk,
      timeEstimateMinutes: i.task.timeEstimateMinutes,
      status: i.status,
      executeDeadline: i.executeDeadline?.toISOString() ?? null,
      submittedAt: i.submittedAt?.toISOString() ?? null,
      reviewNote: i.reviewNote,
      lockedReason: null,
    }));

  const offerCards: TaskCardData[] = available.map((i) => {
    const queue = (i.rotationQueue as unknown as string[]) ?? [];
    const forMe = i.unlockedForUserId === null || i.unlockedForUserId === user.id;
    let lockedReason: string | null = null;
    if (!forMe) {
      const who = names.get(i.unlockedForUserId ?? "") ?? "sourozenec";
      // rotationIndex points at the current holder; after it comes the next child, then open to all.
      const next = i.rotationIndex + 1;
      const mineNext = queue[next] === user.id || next === queue.length;
      lockedReason =
        mineNext && i.unlockExpiresAt
          ? `Teď je na řadě ${who}. Tvůj bude v ${formatTimePrague(i.unlockExpiresAt)}.`
          : `Teď je na řadě ${who}.`;
    }
    return {
      id: i.id,
      name: i.task.name,
      valueCzk: i.task.valueCzk,
      timeEstimateMinutes: i.task.timeEstimateMinutes,
      status: i.status,
      executeDeadline: null,
      submittedAt: null,
      reviewNote: null,
      lockedReason,
    };
  });

  const label = (text: string) => (
    <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">{text}</h2>
  );

  return (
    <div className="flex flex-col gap-3">
      {!checksOk && (
        <ChecksFirstBanner
          sent={sent.length}
          total={checks.length}
          nextName={nextOpen?.dailyCheck.name ?? null}
        />
      )}

      {mineCards.length > 0 && (
        <>
          {label("Moje úkoly")}
          {mineCards.map((t) => (
            <TaskCard key={t.id} task={t} nowIso={nowIso} />
          ))}
        </>
      )}

      {label("Nabídka")}
      {offerCards.length === 0 ? (
        <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
          Teď tu není nic k vydělání.
        </p>
      ) : (
        offerCards.map((t) => (
          <TaskCard key={t.id} task={t} nowIso={nowIso} poolLocked={!checksOk} />
        ))
      )}
    </div>
  );
}
