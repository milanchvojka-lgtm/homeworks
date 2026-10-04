import Link from "next/link";
import { db } from "@/lib/db";
import { startOfDayPrague } from "@/lib/time";
import { AdminSubpage } from "../_components/subpage";

export default async function KompetencePage() {
  const today = startOfDayPrague();

  const competencies = await db.competency.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { dailyChecks: true } },
      assignments: {
        where: { date: today },
        include: { user: { select: { name: true, avatarColor: true } } },
      },
    },
  });

  return (
    <AdminSubpage title="Kompetence" back="/admin/vic">
      <p className="text-sm text-muted-foreground">Role se střídají každý den podle pořadí dětí.</p>

      <ul className="flex flex-col gap-2.5">
        {competencies.map((c) => {
          const a = c.assignments[0];
          return (
            <li key={c.id}>
              <Link
                href={`/admin/kompetence/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-tile border border-border bg-card px-[18px] py-4 transition hover:bg-muted"
              >
                <div>
                  <div className="text-[17px] font-semibold">{c.name}</div>
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
    </AdminSubpage>
  );
}
