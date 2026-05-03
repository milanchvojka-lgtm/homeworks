import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Monitor } from "lucide-react";
import { ANI_CREDIT } from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

export default function AniKredit() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Kredit</h1>

      {/* Balance */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Coins className="size-3" />
            Celkový kredit
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums" style={limeStyle}>
              {ANI_CREDIT.balanceCzk}
            </span>
            <span className="text-sm text-muted-foreground">Kč</span>
          </div>
        </CardContent>
      </Card>

      {/* This week */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Tento týden (26.4. – 3.5.)
          </div>
          <ul className="divide-y divide-border -mx-4 px-4">
            {[
              { label: "Vyděláno", value: ANI_CREDIT.weeklyEarnedCzk },
              { label: "Obrazovka", value: -ANI_CREDIT.weeklyScreenCzk },
              { label: "K výplatě", value: ANI_CREDIT.weeklyPayoutCzk, accent: true },
            ].map(({ label, value, accent }) => (
              <li
                key={label}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={accent ? limeStyle : undefined}
                >
                  {value > 0 ? `+${value}` : value} Kč
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Screen time requester */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Monitor className="size-3" />
            Obrazovkový čas
          </div>
          <div className="flex gap-2">
            {ANI_CREDIT.screenTimeOptions.map((opt) => (
              <Button
                key={opt.minutes}
                variant="outline"
                size="sm"
                disabled
                className="flex-1 flex-col h-auto py-2 gap-0.5"
              >
                <span className="text-sm font-bold">{opt.minutes} min</span>
                <span className="text-[10px] text-muted-foreground">
                  {opt.priceCzk} Kč
                </span>
              </Button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Sazba: {ANI_CREDIT.screenTimeOptions[1].priceCzk} Kč / hodinu
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
