import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MILAN_SETTINGS, MILESTONES } from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

export default function MilanNastaveni() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Nastavení</h1>

      {/* Settings card */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Systémové hodnoty
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Hodinová sazba", value: `${MILAN_SETTINGS.hourlyRateCzk} Kč/h` },
              { label: "Obrazovka / hodina", value: `${MILAN_SETTINGS.screenTimeHourCzk} Kč` },
              { label: "Granularita obrazovky", value: `${MILAN_SETTINGS.screenTimeGranularityMin} min` },
              { label: "Bonus plný", value: `${MILAN_SETTINGS.monthlyBonusFullCzk} Kč` },
              { label: "Bonus krok", value: `${MILAN_SETTINGS.monthlyBonusStepCzk} Kč` },
              { label: "Claim timeout", value: `${MILAN_SETTINGS.defaultClaimTimeoutH} h` },
              { label: "Execute timeout", value: `${MILAN_SETTINGS.defaultExecuteTimeoutH} h` },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </div>
                <div className="text-sm font-semibold tabular-nums">{value}</div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Bonus table */}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Bonus tabulka
            </div>
            <div className="rounded-lg border border-border overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-muted/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Zaváhání</span>
                <span className="text-right">Bonus</span>
              </div>
              {[0, 1, 2, 3, 4].map((miss) => {
                const bonus = Math.max(
                  0,
                  MILAN_SETTINGS.monthlyBonusFullCzk - miss * MILAN_SETTINGS.monthlyBonusStepCzk,
                );
                return (
                  <div
                    key={miss}
                    className="grid grid-cols-2 border-t border-border px-3 py-1.5"
                  >
                    <span>{miss}×</span>
                    <span
                      className="text-right font-semibold tabular-nums"
                      style={bonus > 0 ? limeStyle : undefined}
                    >
                      {bonus > 0 ? `${bonus} Kč` : "0 Kč"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardContent className="px-0 pt-0 pb-0">
          <div className="px-4 pt-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Milníky (trofeje)
          </div>
          <ul className="divide-y divide-border">
            {MILESTONES.map((ms, i) => (
              <li
                key={ms.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i === MILESTONES.length - 1 ? "rounded-b-xl" : ""
                }`}
              >
                <span className="text-lg shrink-0">{ms.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{ms.trophyName}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {ms.days} dnů
                  </div>
                </div>
                {ms.rewardCzk > 0 ? (
                  <span className="text-sm font-bold tabular-nums" style={limeStyle}>
                    +{ms.rewardCzk} Kč
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">bez bonusu</span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
