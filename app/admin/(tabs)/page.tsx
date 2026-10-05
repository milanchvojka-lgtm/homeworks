import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clearedByOther, formatAgo, type Resolution } from "@/lib/approvals-pure";
import { DONE_BY_PARENT_NOTE, EXCUSED_NOTE } from "@/lib/check-notes";
import { startOfDayPrague } from "@/lib/time";
import { formatTimePrague } from "@/app/child/_components/format";
import { ApprovalList, type ApprovalGroup } from "../_components/approval-list";

/**
 * D37: items resolved from the queue today (approved or returned), with who did it. Checks and tasks
 * a parent did for the child (D31) and excused days (D20) never were in the queue and are left out.
 */
async function resolvedToday(): Promise<Resolution[]> {
  const now = new Date();
  const today = { gte: startOfDayPrague(now), lte: now };
  const reviewer = { select: { id: true, name: true } };
  const [checks, tasks] = await Promise.all([
    db.dailyCheckInstance.findMany({
      where: {
        status: { in: ["APPROVED", "REJECTED"] },
        reviewedAt: today,
        reviewerId: { not: null },
        OR: [{ note: null }, { note: { notIn: [DONE_BY_PARENT_NOTE, EXCUSED_NOTE] } }],
      },
      select: { reviewedAt: true, reviewer },
    }),
    db.taskInstance.findMany({
      // A task the parent did themselves has no claimer (D31).
      where: { status: { in: ["DONE", "REJECTED"] }, reviewedAt: today, reviewerId: { not: null }, claimedById: { not: null } },
      select: { reviewedAt: true, reviewerId: true },
    }),
  ]);
  const names = new Map(
    (await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true } })).map((u) => [u.id, u.name]),
  );
  return [
    ...checks.flatMap((c) => (c.reviewer && c.reviewedAt ? [{ reviewer: c.reviewer, reviewedAt: c.reviewedAt }] : [])),
    ...tasks.flatMap((t) =>
      t.reviewerId && t.reviewedAt && names.has(t.reviewerId)
        ? [{ reviewer: { id: t.reviewerId, name: names.get(t.reviewerId)! }, reviewedAt: t.reviewedAt }]
        : [],
    ),
  ];
}

/** Schválit (pen HWR · 01): everything waiting for a parent, grouped by child in rotation order. */
export default async function AdminApprovePage() {
  const user = await getSession();
  if (!user) redirect("/");
  const [children, checks, tasks] = await Promise.all([
    db.user.findMany({
      where: { role: "CHILD" },
      select: { id: true, name: true, avatarColor: true },
      orderBy: [{ rotationOrder: "asc" }, { name: "asc" }],
    }),
    db.dailyCheckInstance.findMany({
      where: { status: "SUBMITTED" },
      include: { dailyCheck: { include: { competency: { select: { name: true } } } } },
      orderBy: { submittedAt: "asc" },
    }),
    db.taskInstance.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { task: { select: { name: true, valueCzk: true } } },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const at = (d: Date | null) => (d ? ` · nahlášeno ${formatTimePrague(d)}` : "");
  const groups: ApprovalGroup[] = children.map((user) => ({
    user,
    items: [
      ...checks
        .filter((c) => c.userId === user.id)
        .map((c) => ({
          id: c.id,
          kind: "check" as const,
          title: c.dailyCheck.name,
          meta: `${c.dailyCheck.competency.name}${at(c.submittedAt)}`,
        })),
      ...tasks
        .filter((t) => t.claimedById === user.id)
        .map((t) => ({
          id: t.id,
          kind: "task" as const,
          title: t.task.name,
          meta: `Úkol · ${t.task.valueCzk} Kč${at(t.submittedAt)}`,
        })),
    ],
  }));

  const waiting = groups.filter((g) => g.items.length > 0);
  // D37, pen HWV · 01: an empty queue says who emptied it, when it was the other parent.
  const cleared = waiting.length === 0 ? clearedByOther(await resolvedToday(), user.id) : null;
  const clearedText = cleared ? `Vyřízeno: ${cleared.count} · ${cleared.name} · ${formatAgo(cleared.at)}` : undefined;

  return <ApprovalList groups={waiting} clearedText={clearedText} />;
}
