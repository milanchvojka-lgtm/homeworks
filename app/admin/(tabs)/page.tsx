import { db } from "@/lib/db";
import { formatTimePrague } from "@/app/child/_components/format";
import { ApprovalList, type ApprovalGroup } from "../_components/approval-list";

/** Schválit (pen HWR · 01): everything waiting for a parent, grouped by child in rotation order. */
export default async function AdminApprovePage() {
  const [children, checks, tasks, screens] = await Promise.all([
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
    db.screenTimeRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
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
      ...screens
        .filter((s) => s.userId === user.id)
        .map((s) => ({
          id: s.id,
          kind: "screen" as const,
          title: `${s.minutes} min screen time`,
          meta: `Screen time · ${s.costCzk} Kč · požádala ${formatTimePrague(s.createdAt)}`,
        })),
    ],
  }));

  return <ApprovalList groups={groups.filter((g) => g.items.length > 0)} />;
}
