import type { BonusStatus } from "@/lib/bonus";

export function BonusBanner({
  status,
  amount,
}: {
  status: BonusStatus;
  amount: number;
}) {
  if (status.stillInGame) {
    return (
      <div className="rounded-xl border border-border bg-secondary/60 p-3 text-sm">
        <span className="font-medium">🎯 Bonus tento měsíc stále ve hře</span>
        <span className="ml-1" style={{ color: "var(--chart-1)" }}>
          ({amount} Kč)
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3 text-sm">
      <span className="font-medium">😞 Bonus tento měsíc už ne</span>
      <span className="ml-1 text-muted-foreground">
        — zaváhala jsi {formatLostOn(status.lostOn)}.
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
