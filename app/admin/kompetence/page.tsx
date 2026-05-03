import Link from "next/link";
import { db } from "@/lib/db";
import { startOfWeekPrague } from "@/lib/time";

export default async function KompetencePage() {
  const weekStart = startOfWeekPrague();

  const competencies = await db.competency.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { dailyChecks: true } },
      assignments: {
        where: { weekStart },
        include: { user: { select: { name: true, avatarColor: true } } },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Kompetence</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tento týden je přiřazené dle rotace.
      </p>

      <ul className="mt-6 space-y-2">
        {competencies.map((c) => {
          const a = c.assignments[0];
          return (
            <li key={c.id}>
              <Link
                href={`/admin/kompetence/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:bg-muted"
              >
                <div>
                  <div className="text-base font-medium">{c.name}</div>
                  {c.description && (
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {c.description}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {c._count.dailyChecks} denních checků
                  </div>
                </div>
                {a && (
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: a.user.avatarColor }}
                    >
                      {a.user.name[0]}
                    </div>
                    <span>{a.user.name}</span>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
