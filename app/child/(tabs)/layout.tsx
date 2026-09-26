import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import { getAppSettings, getWeekTotals } from "@/lib/credit";
import { AppHeader, StatusTiles } from "../_components/status-header";
import { czkToMinutes } from "../_components/format";

/** Tabs (Dnes, Vydělat, Obrazovka, Já + their subpages) carry the app header and status tiles. */
export default async function ChildTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");

  const [week, settings, bonus, streak] = await Promise.all([
    getWeekTotals(user.id),
    getAppSettings(),
    getBonusStatus(user.id),
    db.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true },
    }),
  ]);

  return (
    <>
      <AppHeader name={user.name} />
      <main className="flex flex-1 flex-col gap-5 px-4 pt-4 pb-4">
        <StatusTiles
          payoutCzk={Math.max(0, week.earnedCzk - week.screenTimeCzk)}
          screenMinutes={czkToMinutes(week.screenTimeCzk, settings.screenTimeHourCostCzk)}
          streakDays={streak?.currentStreak ?? 0}
          bonusCzk={bonus.currentBonusCzk}
        />
        <div>{children}</div>
      </main>
    </>
  );
}
