import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function ChildHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const payouts = await db.weeklyPayout.findMany({
    where: { userId: user.id },
    orderBy: { weekStart: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-3">
      {payouts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Zatím žádný uzavřený týden.
          </CardContent>
        </Card>
      ) : (
        <>
          {payouts.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    Týden {formatWeek(p.weekStart, p.weekEnd)}
                  </div>
                  {p.paidOutAt ? (
                    <Badge
                      style={{
                        backgroundColor: "var(--chart-1)",
                        color: "var(--background)",
                      }}
                    >
                      Vyplaceno
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Čeká na výplatu</Badge>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <Stat label="Vyděláno" value={`${p.totalEarnedCzk} Kč`} />
                  <Stat label="Obrazovka" value={`${p.totalScreenTimeCzk} Kč`} />
                  <Stat
                    label="V hotovosti"
                    value={`${p.totalPayoutCzk} Kč`}
                    highlight
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </>
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
      <div className="text-[10px] font-bold uppercase tracking-[0.18em]">
        {label}
      </div>
      <div
        className="mt-0.5 text-sm tabular-nums"
        style={highlight ? { color: "var(--chart-1)" } : undefined}
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
