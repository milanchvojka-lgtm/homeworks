import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ANI_HISTORY } from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

export default function AniHistorie() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Historie výplat</h1>
      <div className="space-y-2">
        {ANI_HISTORY.map((week) => (
          <Card key={week.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {week.weekStart} → {week.weekEnd}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      vydělano {week.earnedCzk} Kč
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · obrazovka {week.screenCzk} Kč
                    </span>
                  </div>
                  {week.bonusNote && (
                    <div className="mt-0.5 text-[10px] font-semibold" style={limeStyle}>
                      {week.bonusNote}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-base font-bold tabular-nums" style={limeStyle}>
                    {week.payoutCzk} Kč
                  </span>
                  <Badge
                    variant={week.paidOutAt ? "default" : "outline"}
                    className="text-[9px] uppercase tracking-wider"
                  >
                    {week.paidOutAt ? "Vyplaceno" : "Čeká"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
