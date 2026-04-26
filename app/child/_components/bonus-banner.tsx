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
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
        <span className="font-medium">🎯 Bonus tento měsíc stále ve hře</span>
        <span className="ml-1 text-emerald-700 dark:text-emerald-400">
          ({amount} Kč)
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span className="font-medium">😞 Bonus tento měsíc už ne</span>
      <span className="ml-1 text-zinc-600 dark:text-zinc-400">
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
