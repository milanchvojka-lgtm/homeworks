import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function ChildHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const payouts = await db.weeklyPayout.findMany({
    where: { userId: user.id },
    orderBy: { weekStart: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Historie</h1>
      {payouts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          Zatím žádný uzavřený týden.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {payouts.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  Týden {formatWeek(p.weekStart, p.weekEnd)}
                </div>
                <div
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.paidOutAt
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {p.paidOutAt ? "Vyplaceno" : "Čeká na výplatu"}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-zinc-500">
                <Stat label="Vyděláno" value={`${p.totalEarnedCzk} Kč`} />
                <Stat label="Obrazovka" value={`${p.totalScreenTimeCzk} Kč`} />
                <Stat
                  label="V hotovosti"
                  value={`${p.totalPayoutCzk} Kč`}
                  highlight
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="uppercase tracking-wide">{label}</div>
      <div
        className={`mt-0.5 text-sm ${highlight ? "font-semibold text-zinc-900 dark:text-zinc-100" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function formatWeek(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}
