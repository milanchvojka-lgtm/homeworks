import Link from "next/link";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";

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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Úkoly</h1>
        <Link href="/admin/ukoly/novy" className={buttonVariants({ size: "sm" })}>
          + Nový
        </Link>
      </div>

      <ul className="mt-6 space-y-2">
        {tasks.length === 0 && (
          <li className="text-sm text-muted-foreground">Zatím nic. Vytvoř první úkol.</li>
        )}
        {tasks.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/ukoly/${t.id}`}
              className={`flex items-center justify-between rounded-xl border border-border p-4 transition ${
                t.isActive
                  ? "bg-card hover:bg-muted"
                  : "bg-muted opacity-60"
              }`}
            >
              <div>
                <div className="text-base font-medium">
                  {t.name}
                  {!t.isActive && (
                    <span className="ml-2 text-xs text-muted-foreground">(neaktivní)</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
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
    </div>
  );
}
