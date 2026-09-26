import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getAppSettings, getWeekTotals } from "@/lib/credit";
import { endOfWeekPrague, startOfWeekPrague } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { czkToMinutes, formatMinutes } from "../_components/format";
import { BackButton } from "./_back-button";

/**
 * Týdenní výpis (návrh 2, frame 05) = former Kredit (this week) + Historie.
 * Own header with a back arrow instead of the status tiles, so 380 Kč is not shown twice.
 */
export default async function ChildStatementPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [week, settings, payouts] = await Promise.all([
    getWeekTotals(user.id),
    getAppSettings(),
    db.weeklyPayout.findMany({
      where: { userId: user.id },
      orderBy: { weekStart: "desc" },
      take: 20,
    }),
  ]);
  const payout = Math.max(0, week.earnedCzk - week.screenTimeCzk);
  const screenMin = czkToMinutes(week.screenTimeCzk, settings.screenTimeHourCostCzk);

  return (
    <>
      <header className="border-b border-border bg-card px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-1">
          <BackButton />
          <h1 className="text-[22px] font-bold tracking-tight">Týdenní výpis</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4 pt-5 pb-4">
        <section className="flex flex-col gap-3 rounded-tile border border-border bg-card p-[18px]">
          <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
            Tento týden · {formatWeek(startOfWeekPrague(), endOfWeekPrague())}
          </span>
          <Row label="Vyděláno" value={`${week.earnedCzk} Kč`} />
          <Row label={`Screen time (${formatMinutes(screenMin)})`} value={week.screenTimeCzk > 0 ? `−${week.screenTimeCzk} Kč` : "0 Kč"} />
          <div className="flex items-center justify-between border-t border-muted pt-3">
            <span className="text-[17px] font-semibold">K výplatě v neděli</span>
            <span className="font-mono text-[30px] font-bold text-highlight">{payout} Kč</span>
          </div>
        </section>

        <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">
          Předchozí týdny
        </h2>
        {payouts.length === 0 ? (
          <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
            Zatím žádný uzavřený týden.
          </p>
        ) : (
          payouts.map((p) => (
            <div
              key={p.id}
              className="flex min-h-[60px] items-center gap-3 rounded-tile border border-border bg-card px-[18px]"
            >
              <span className="flex-1 text-[17px] font-semibold">
                {formatWeek(p.weekStart, p.weekEnd)}
              </span>
              <span className="font-mono text-[17px] font-bold">{p.totalPayoutCzk} Kč</span>
              {p.paidOutAt ? (
                <Badge variant="success">
                  <Check />
                  Vyplaceno
                </Badge>
              ) : (
                <Badge variant="warning">Čeká na výplatu</Badge>
              )}
            </div>
          ))
        )}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

function formatWeek(start: Date, end: Date): string {
  const f = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", timeZone: "Europe/Prague" });
  const s = f(start).replace(/\s/g, "");
  const e = f(end).replace(/\s/g, "");
  const [sd, sm] = s.split(".");
  const [, em] = e.split(".");
  return sm === em ? `${sd}.–${e}` : `${s}–${e}`;
}
