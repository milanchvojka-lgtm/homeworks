import type { BonusStatus } from "@/lib/bonus";

export function BonusBanner({ status }: { status: BonusStatus }) {
  const { misses, currentBonusCzk, fullBonusCzk, lostOn } = status;

  if (misses === 0) {
    return (
      <div className="rounded-xl border border-border bg-secondary/60 p-3 text-sm">
        <span className="font-medium">🎯 Bonus tento měsíc stále ve hře</span>
        <span className="ml-1" style={{ color: "var(--chart-1)" }}>
          ({currentBonusCzk} Kč)
        </span>
      </div>
    );
  }

  if (currentBonusCzk > 0) {
    return (
      <div className="rounded-xl border border-border bg-secondary/60 p-3 text-sm">
        <span className="font-medium">
          ⚠️ Bonus snížený po {misses}× zaváhání
        </span>
        <span className="ml-1 text-muted-foreground">
          ({currentBonusCzk} Kč z {fullBonusCzk} Kč)
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3 text-sm">
      <span className="font-medium">😞 Bonus tento měsíc už ne</span>
      <span className="ml-1 text-muted-foreground">
        — zaváhala jsi {lostOn ? formatLostOn(lostOn) : "vícekrát"}.
      </span>
    </div>
  );
}

function formatLostOn(d: Date): string {
  return new Date(d).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
  });
}
