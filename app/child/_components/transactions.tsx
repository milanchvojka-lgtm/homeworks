import "server-only";
import { db } from "@/lib/db";
import { formatDayPrague } from "./format";

export type TransactionItem = { id: string; title: string; sub: string; amountCzk: number };

/**
 * „Za co" (pen HW2 · 05): the child's credit transactions in [from, to], newest first.
 * Payouts are left out: a paid week shows its payout in the week row.
 */
export async function getTransactionItems(
  userId: string,
  from: Date,
  to: Date,
): Promise<(TransactionItem & { createdAt: Date })[]> {
  const txs = await db.creditTransaction.findMany({
    where: { userId, createdAt: { gte: from, lte: to }, type: { not: "PAYOUT" } },
    orderBy: { createdAt: "desc" },
  });
  const taskIds = txs.filter((t) => t.type === "TASK_REWARD" && t.referenceId).map((t) => t.referenceId!);
  const tasks = await db.taskInstance.findMany({
    where: { id: { in: taskIds } },
    select: { id: true, task: { select: { name: true } } },
  });
  const taskName = new Map(tasks.map((t) => [t.id, t.task.name]));

  return txs.map((t) => {
    const day = formatDayPrague(t.createdAt);
    const base = { id: t.id, amountCzk: t.amountCzk, createdAt: t.createdAt };
    switch (t.type) {
      case "TASK_REWARD":
        return { ...base, title: taskName.get(t.referenceId ?? "") ?? "Úkol", sub: `${day} · úkol` };
      case "SCREEN_TIME":
        return { ...base, title: `Screen time ${t.note ?? ""}`.trim(), sub: day };
      case "ADJUSTMENT":
        return { ...base, title: "Úprava kreditu", sub: `${day} · od rodiče` };
      default:
        // MONTHLY_BONUS, STREAK_MILESTONE: the note carries the name.
        return { ...base, title: t.note ?? "Bonus", sub: day };
    }
  });
}

/** Pen `TransactionRow` list. */
export function TransactionList({ items }: { items: TransactionItem[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((t) => (
        <li
          key={t.id}
          className="flex min-h-[60px] items-center gap-3 border-b border-muted px-[18px] last:border-b-0"
        >
          <span className="flex flex-1 flex-col gap-0.5 py-2">
            <span className="font-semibold">{t.title}</span>
            <span className="font-mono text-xs text-muted-foreground">{t.sub}</span>
          </span>
          <span className="font-mono font-bold">
            {t.amountCzk > 0 ? `+${t.amountCzk}` : `−${Math.abs(t.amountCzk)}`} Kč
          </span>
        </li>
      ))}
    </ul>
  );
}
