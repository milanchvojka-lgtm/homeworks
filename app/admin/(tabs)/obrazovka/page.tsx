import { db } from "@/lib/db";
import { computeScreenTimeCost, getAppSettings, getWeekBalance, SCREEN_RECORD_MINUTES } from "@/lib/credit";
import { getWeekScreenRecords } from "@/lib/screen-time";
import { EmptyState } from "@/app/_components/empty-state";
import { formatDayPrague, formatMinutes, formatTimePrague } from "@/app/child/_components/format";
import { TransactionList } from "@/app/child/_components/transactions";
import { MonitorPlay } from "lucide-react";
import { CancelRecord, RecordScreen } from "../../_components/record-screen";

/** Screen time (D30, pen HWS · 01B): record what was approved in iOS, then this week's records. */
export default async function AdminScreenPage() {
  const [children, settings, records] = await Promise.all([
    db.user.findMany({
      where: { role: "CHILD" },
      select: { id: true, name: true, avatarColor: true },
      orderBy: [{ rotationOrder: "asc" }, { name: "asc" }],
    }),
    getAppSettings(),
    getWeekScreenRecords(),
  ]);
  const kids = await Promise.all(
    children.map(async (c) => ({ ...c, netCzk: (await getWeekBalance(c.id)).netCzk })),
  );

  return (
    <div className="flex flex-col gap-3">
      <RecordScreen
        kids={kids}
        options={SCREEN_RECORD_MINUTES.map((m) => ({
          minutes: m,
          costCzk: computeScreenTimeCost(m, settings.screenTimeHourCostCzk),
        }))}
      />

      <h2 className="mt-3 font-mono text-xs font-bold tracking-[0.12em] uppercase">Tento týden</h2>
      {records.length === 0 ? (
        <EmptyState Icon={MonitorPlay} title="Tento týden nic" text="Zápisy všech holek se ukážou tady." className="py-8" />
      ) : (
        <div className="rounded-tile border border-border bg-card">
          <TransactionList
            items={records.map((r) => ({
              id: r.id,
              title: `${r.childName} · ${formatMinutes(r.minutes)}`,
              sub: `${formatDayPrague(r.recordedAt)} · ${formatTimePrague(r.recordedAt)}`,
              amountCzk: -r.costCzk,
              action: r.cancellable ? <CancelRecord id={r.id} /> : undefined,
            }))}
          />
        </div>
      )}
    </div>
  );
}
