import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MILAN_PAYOUTS } from "@/app/showcase/_data";
import { Avatar } from "@/app/showcase/_components/avatar";

const limeStyle = { color: "var(--chart-1)" };

export default function MilanVyplaty() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Výplaty</h1>
      <div className="space-y-3">
        {MILAN_PAYOUTS.map((week) => (
          <Card key={week.id}>
            <CardContent className="pt-3 pb-3">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {week.weekLabel}
              </div>
              <ul className="divide-y divide-border -mx-4 px-4">
                {week.payouts.map((p, j) => (
                  <li
                    key={j}
                    className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={p.userName} color={p.avatarColor} size="sm" />
                      <span className="text-sm">{p.userName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums" style={limeStyle}>
                        {p.amountCzk} Kč
                      </span>
                      <Badge
                        variant={p.paid ? "default" : "outline"}
                        className="text-[9px] uppercase tracking-wider"
                      >
                        {p.paid ? "Vyplaceno" : "Čeká"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
