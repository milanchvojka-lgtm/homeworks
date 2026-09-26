import Link from "next/link";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { AdminSubpage } from "../_components/subpage";

export default async function AdminTasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { instances: true } },
      instances: {
        where: { status: { in: ["AVAILABLE", "CLAIMED", "PENDING_REVIEW"] } },
        select: { id: true, status: true },
      },
    },
  });

  return (
    <AdminSubpage title="Úkoly" back="/admin/vic">
      <Link href="/admin/ukoly/novy" className={buttonVariants({ className: "w-full" })}>
        Nový úkol
      </Link>

      <ul className="mt-1 flex flex-col gap-2.5">
        {tasks.length === 0 && (
          <li className="text-sm text-muted-foreground">Zatím nic. Vytvoř první úkol.</li>
        )}
        {tasks.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/ukoly/${t.id}`}
              className={`flex items-center justify-between gap-3 rounded-tile border border-border px-[18px] py-4 transition ${
                t.isActive
                  ? "bg-card hover:bg-muted"
                  : "bg-muted opacity-60"
              }`}
            >
              <div>
                <div className="text-[17px] font-semibold">
                  {t.name}
                  {!t.isActive && (
                    <span className="ml-2 text-xs text-muted-foreground">(neaktivní)</span>
                  )}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {t.valueCzk} Kč
                  {t.timeEstimateMinutes
                    ? ` • ~${t.timeEstimateMinutes} min`
                    : ""}
                  {t.frequencyDays
                    ? ` • opakuje se každých ${t.frequencyDays} dní`
                    : " • jednorázový"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {t.instances.length > 0
                  ? `${t.instances.length} aktivní`
                  : `${t._count.instances}× celkem`}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AdminSubpage>
  );
}
