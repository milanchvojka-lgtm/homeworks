import { db } from "@/lib/db";
import { InboxList } from "./_components/inbox-list";

export default async function AdminInbox() {
  const submitted = await db.dailyCheckInstance.findMany({
    where: { status: "SUBMITTED" },
    include: {
      user: { select: { id: true, name: true, avatarColor: true } },
      dailyCheck: { include: { competency: { select: { name: true } } } },
    },
    orderBy: { submittedAt: "asc" },
  });

  const groupedByUser = new Map<
    string,
    {
      user: { id: string; name: string; avatarColor: string };
      items: typeof submitted;
    }
  >();
  for (const s of submitted) {
    const existing = groupedByUser.get(s.userId);
    if (existing) existing.items.push(s);
    else groupedByUser.set(s.userId, { user: s.user, items: [s] });
  }

  const groups = Array.from(groupedByUser.values());

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {submitted.length === 0
          ? "Nic ke schválení."
          : `${submitted.length} položek čeká na schválení`}
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
            <InboxList
              items={g.items.map((i) => ({
                id: i.id,
                checkName: i.dailyCheck.name,
                competencyName: i.dailyCheck.competency.name,
                submittedAt: i.submittedAt?.toISOString() ?? null,
              }))}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
