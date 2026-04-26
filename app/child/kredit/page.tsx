import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  computeScreenTimeCost,
  getAppSettings,
  getCurrentBalance,
  getWeekTotals,
} from "@/lib/credit";
import { ScreenTimeRequester } from "../_components/screen-time-requester";

export default async function ChildCreditPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [balance, weekTotals, settings, pendingRequest] = await Promise.all([
    getCurrentBalance(user.id),
    getWeekTotals(user.id),
    getAppSettings(),
    db.screenTimeRequest.findFirst({
      where: { userId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const offers = [30, 60, 90].map((m) => ({
    minutes: m,
    cost: computeScreenTimeCost(m, settings.screenTimeHourCostCzk),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Kredit</h1>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tento týden
        </div>
        <Row label="Vyděláno" value={`${weekTotals.earnedCzk} Kč`} />
        <Row
          label="Vyčerpáno na obrazovku"
          value={`${weekTotals.screenTimeCzk} Kč`}
        />
        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <Row
            label="K výplatě"
            value={`${Math.max(0, weekTotals.earnedCzk - weekTotals.screenTimeCzk)} Kč`}
            bold
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Aktuální balanc
        </div>
        <div className="mt-1 text-3xl font-semibold">{balance} Kč</div>
        <p className="mt-1 text-xs text-zinc-500">
          Suma všech transakcí (vč. minulých týdnů). Z toho si můžeš nechat
          poslat obrazovku.
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Bonus
        </div>
        <div className="mt-1 text-sm">Bonus tento měsíc stále ve hře 🎯</div>
        <p className="mt-1 text-xs text-zinc-500">
          (Logika měsíčního bonusu přijde v M5.)
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">Chci obrazovku</h2>
        {pendingRequest ? (
          <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            ⏳ Žádost o {pendingRequest.minutes} min ({pendingRequest.costCzk}{" "}
            Kč) čeká na schválení.
          </div>
        ) : (
          <ScreenTimeRequester
            offers={offers}
            balance={balance}
          />
        )}
      </section>

      <Link
        href="/child/historie"
        className="mt-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        Historie minulých týdnů →
      </Link>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="mt-1 flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={bold ? "text-base font-semibold" : ""}>{value}</span>
    </div>
  );
}
