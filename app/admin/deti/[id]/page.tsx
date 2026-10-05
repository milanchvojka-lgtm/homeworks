import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Plane } from "lucide-react";
import { db } from "@/lib/db";
import { getBonusStatus } from "@/lib/bonus";
import { getAppSettings, getWeekBalance } from "@/lib/credit";
import { endOfWeekPrague, startOfDayPrague, startOfWeekPrague } from "@/lib/time";
import { BackHeader } from "@/app/_components/app-header";
import { czkToMinutes, formatDayRange, formatMinutes } from "@/app/child/_components/format";
import { TransactionList, getTransactionItems } from "@/app/child/_components/transactions";
import { getChildWeek } from "../../_components/child-days";
import { DayRow } from "../../_components/day-row";

/** "2 dny", "1 den", "5 dní". */
function days(n: number): string {
  if (n === 1) return "1 den";
  if (n >= 2 && n <= 4) return `${n} dny`;
  return `${n} dní`;
}

/**
 * Detail dítěte (pen HWR · 03): this week (with carried debt, D30), what it is for (the child's
 * „Za co" list), days of the week with excuse (D20).
 */
export default async function AdminChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const child = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, currentStreak: true },
  });
  if (!child || child.role !== "CHILD") notFound();

  const [week, settings, bonus, weekDays, absence, items] = await Promise.all([
    getWeekBalance(id),
    getAppSettings(),
    getBonusStatus(id),
    getChildWeek(id),
    // Running or next upcoming absence (D24).
    db.absence.findFirst({ where: { userId: id, toDate: { gte: startOfDayPrague() } }, orderBy: { fromDate: "asc" } }),
    getTransactionItems(id, startOfWeekPrague(), startOfWeekPrague()),
  ]);
  const screenMin = czkToMinutes(week.screenTimeCzk, settings.screenTimeHourCostCzk);

  const f = (d: Date) =>
    d
      .toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", timeZone: "Europe/Prague" })
      .replace(/\s/g, "");
  const [sd, sm] = f(startOfWeekPrague()).split(".");
  const end = f(endOfWeekPrague());
  // "21.–27. 9." within a month, "28. 9.–4. 10." across two.
  const weekLabel =
    sm === end.split(".")[1] ? `${sd}.–${end.replace(".", ". ")}` : `${f(startOfWeekPrague())}–${end}`;

  return (
    <>
      <BackHeader title={child.name} fallbackHref="/admin/deti" />
      <main className="flex flex-1 flex-col gap-3 px-4 pt-5 pb-4">
        <section className="flex flex-col gap-2.5 rounded-tile border border-border bg-card p-[18px]">
          <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
            Tento týden · {weekLabel}
          </span>
          <Row label="Vyděláno" value={`${week.earnedCzk} Kč`} />
          <Row
            label={`Screen time · ${formatMinutes(screenMin)}`}
            value={week.screenTimeCzk > 0 ? `−${week.screenTimeCzk} Kč` : "0 Kč"}
          />
          {week.debtInCzk < 0 && (
            <Row label="Dluh z minulého týdne" value={`−${-week.debtInCzk} Kč`} />
          )}
          <div className="flex items-center justify-between border-t border-muted pt-2.5">
            <span className="font-bold">K výplatě</span>
            <span className={`font-mono text-xl font-bold ${week.netCzk < 0 ? "text-destructive" : ""}`}>
              {week.netCzk < 0 ? `−${-week.netCzk}` : week.netCzk} Kč
            </span>
          </div>
          <div className="flex flex-col gap-2.5 border-t border-muted pt-2.5">
            <Row label="Řada" value={days(child.currentStreak)} />
            <Row label="Měsíční bonus ve hře" value={`${bonus.currentBonusCzk} Kč`} />
          </div>
        </section>

        {absence && (
          <Link
            href="/admin/nepritomnost"
            className="flex min-h-14 items-center gap-2.5 rounded-tile border border-border bg-card pr-3.5 pl-[18px]"
          >
            <Plane className="size-[18px] text-muted-foreground" />
            <span className="flex-1 font-semibold">
              Pryč {formatDayRange(absence.fromDate, absence.toDate)}
              {absence.note ? ` · ${absence.note}` : ""}
            </span>
            <ChevronRight className="size-[18px] text-subtle" />
          </Link>
        )}

        <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">Za co</h2>
        {items.length === 0 ? (
          <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
            Tento týden zatím nic.
          </p>
        ) : (
          <div className="rounded-tile border border-border bg-card">
            <TransactionList items={items} />
          </div>
        )}

        <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">Dny týdne</h2>
        {weekDays.map((d) => (
          <DayRow key={d.iso} day={d} userId={child.id} childName={child.name} />
        ))}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[15px] font-bold">{value}</span>
    </div>
  );
}
