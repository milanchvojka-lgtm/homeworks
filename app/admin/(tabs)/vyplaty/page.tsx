import { db } from "@/lib/db";
import { PayoutsList } from "./_payouts-list";

/** Výplaty (pen HWR · 04): unpaid weeks first, amount as the main number. */
export default async function AdminPayoutsPage() {
  const payouts = await db.weeklyPayout.findMany({
    orderBy: [{ weekStart: "desc" }],
    include: {
      user: { select: { id: true, name: true, avatarColor: true, rotationOrder: true } },
    },
    take: 60,
  });

  if (payouts.length === 0) {
    return (
      <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
        Zatím žádný uzavřený týden.
      </p>
    );
  }

  return (
    <PayoutsList
      payouts={payouts
        .sort(
          (a, b) =>
            b.weekStart.getTime() - a.weekStart.getTime() ||
            (a.user.rotationOrder ?? 99) - (b.user.rotationOrder ?? 99),
        )
        .map((p) => ({
          id: p.id,
          weekStart: p.weekStart.toISOString(),
          weekEnd: p.weekEnd.toISOString(),
          user: { id: p.user.id, name: p.user.name, avatarColor: p.user.avatarColor },
          totalEarnedCzk: p.totalEarnedCzk,
          totalScreenTimeCzk: p.totalScreenTimeCzk,
          bonusCzk: p.bonusCzk,
          totalPayoutCzk: p.totalPayoutCzk,
          paidOutAt: p.paidOutAt?.toISOString() ?? null,
        }))}
    />
  );
}
