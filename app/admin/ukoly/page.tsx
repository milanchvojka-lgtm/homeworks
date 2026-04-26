import Link from "next/link";
import { db } from "@/lib/db";

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
        <Link
          href="/admin/ukoly/novy"
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          + Nový
        </Link>
      </div>

      <ul className="mt-6 space-y-2">
        {tasks.length === 0 && (
          <li className="text-sm text-zinc-500">Zatím nic. Vytvoř první úkol.</li>
        )}
        {tasks.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/ukoly/${t.id}`}
              className={`flex items-center justify-between rounded-xl border p-4 transition ${
                t.isActive
                  ? "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                  : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/50"
              }`}
            >
              <div>
                <div className="text-base font-medium">
                  {t.name}
                  {!t.isActive && (
                    <span className="ml-2 text-xs text-zinc-500">(neaktivní)</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {t.valueCzk} Kč
                  {t.timeEstimateMinutes
                    ? ` • ~${t.timeEstimateMinutes} min`
                    : ""}
                  {t.frequencyDays
                    ? ` • opakuje se každých ${t.frequencyDays} dní`
                    : " • jednorázový"}
                </div>
              </div>
              <div className="text-xs text-zinc-500">
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
