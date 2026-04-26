import { db } from "@/lib/db";
import { InboxList } from "./_components/inbox-list";

export default async function AdminInbox() {
  const submittedChecks = await db.dailyCheckInstance.findMany({
    where: { status: "SUBMITTED" },
    include: {
      user: { select: { id: true, name: true, avatarColor: true } },
      dailyCheck: { include: { competency: { select: { name: true } } } },
    },
    orderBy: { submittedAt: "asc" },
  });

  const pendingTasks = await db.taskInstance.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      task: { select: { name: true, valueCzk: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  const claimerIds = Array.from(
    new Set(pendingTasks.map((t) => t.claimedById).filter(Boolean) as string[]),
  );
  const claimers = await db.user.findMany({
    where: { id: { in: claimerIds } },
    select: { id: true, name: true, avatarColor: true },
  });
  const claimerById = new Map(claimers.map((c) => [c.id, c]));

  type GroupItem = {
    id: string;
    kind: "check" | "task";
    title: string;
    subtitle: string;
    submittedAt: string | null;
  };

  const grouped = new Map<
    string,
    {
      user: { id: string; name: string; avatarColor: string };
      items: GroupItem[];
    }
  >();

  for (const c of submittedChecks) {
    const g = grouped.get(c.userId) ?? { user: c.user, items: [] };
    g.items.push({
      id: c.id,
      kind: "check",
      title: c.dailyCheck.name,
      subtitle: c.dailyCheck.competency.name,
      submittedAt: c.submittedAt?.toISOString() ?? null,
    });
    grouped.set(c.userId, g);
  }

  for (const t of pendingTasks) {
    if (!t.claimedById) continue;
    const user = claimerById.get(t.claimedById);
    if (!user) continue;
    const g = grouped.get(user.id) ?? { user, items: [] };
    g.items.push({
      id: t.id,
      kind: "task",
      title: t.task.name,
      subtitle: `Úkol • ${t.task.valueCzk} Kč`,
      submittedAt: t.submittedAt?.toISOString() ?? null,
    });
    grouped.set(user.id, g);
  }

  const groups = Array.from(grouped.values());
  const total = submittedChecks.length + pendingTasks.length;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {total === 0
          ? "Nic ke schválení."
          : `${total} položek čeká na schválení`}
      </p>

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <section key={g.user.id}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: g.user.avatarColor }}
              >
                {g.user.name[0]}
              </div>
              <span className="text-sm font-medium">{g.user.name}</span>
            </div>
            <InboxList items={g.items} />
          </section>
        ))}
      </div>
    </div>
  );
}
