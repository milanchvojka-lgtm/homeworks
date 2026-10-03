import { redirect } from "next/navigation";
import { CircleAlert, MonitorPlay } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getWeekBalance } from "@/lib/credit";
import { getWeekScreenRecords } from "@/lib/screen-time";
import { EmptyState } from "@/app/_components/empty-state";
import { formatDayPrague, formatMinutes, formatTimePrague } from "../../_components/format";
import { TransactionList } from "../../_components/transactions";

/**
 * Screen time (D30, pen HWS · 03 / 03b / 03c): only an overview. Time is asked for in iOS,
 * a parent records it. The week's total minutes and money live in the header tile, not here.
 */
export default async function ChildScreenPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [records, week] = await Promise.all([getWeekScreenRecords(user.id), getWeekBalance(user.id)]);

  return (
    <div className="flex flex-col gap-3">
      {week.netCzk < 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-danger-soft px-4 py-3.5">
          <CircleAlert className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">Jsi v mínusu</p>
            <p className="text-sm text-muted-foreground">
              Dluh se odečte z nedělní výplaty. Co nestačí, přejde do dalšího týdne.
            </p>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState
          Icon={MonitorPlay}
          title="Tento týden nic"
          text="O čas si řekneš v iPhonu. Tady uvidíš, kolik tě stál."
          className="py-12"
        />
      ) : (
        <>
          <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">Tento týden</h2>
          <div className="rounded-tile border border-border bg-card">
            <TransactionList
              items={records.map((r) => ({
                id: r.id,
                title: `Screen time ${formatMinutes(r.minutes)}`,
                sub: `${formatDayPrague(r.recordedAt)} · ${formatTimePrague(r.recordedAt)}`,
                amountCzk: -r.costCzk,
              }))}
            />
          </div>
          <p className="px-0.5 text-[13px] text-subtle">
            O čas si řekneš v iPhonu. Tady vidíš, kolik tě stál.
          </p>
        </>
      )}
    </div>
  );
}
