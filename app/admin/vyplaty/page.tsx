import { db } from "@/lib/db";
import { PayoutsList } from "./_payouts-list";

export default async function AdminPayoutsPage() {
  const payouts = await db.weeklyPayout.findMany({
    orderBy: [{ weekStart: "desc" }, { userId: "asc" }],
    include: {
      user: { select: { id: true, name: true, avatarColor: true } },
    },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Výplaty</h1>
      {payouts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Žádné uzavřené týdny.</p>
      ) : (
        <PayoutsList
          payouts={payouts.map((p) => ({
            id: p.id,
            weekStart: p.weekStart.toISOString(),
            weekEnd: p.weekEnd.toISOString(),
            user: p.user,
            totalEarnedCzk: p.totalEarnedCzk,
            totalScreenTimeCzk: p.totalScreenTimeCzk,
            bonusCzk: p.bonusCzk,
            totalPayoutCzk: p.totalPayoutCzk,
            paidOutAt: p.paidOutAt?.toISOString() ?? null,
          }))}
        />
      )}
    </div>
  );
}
