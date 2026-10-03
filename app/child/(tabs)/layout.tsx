import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import { getAppSettings, getWeekBalance } from "@/lib/credit";
import { AppHeader } from "@/app/_components/app-header";
import { StatusTiles } from "../_components/status-header";
import { czkToMinutes } from "../_components/format";
import { startOfDayPrague } from "@/lib/time";

/** Tabs (Dnes, Vydělat, Screen time, Já + their subpages) carry the app header and status tiles. */
export default async function ChildTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");

  const [week, settings, bonus, streak] = await Promise.all([
    getWeekBalance(user.id),
    getAppSettings(),
    getBonusStatus(user.id),
    db.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true, trialEndsOn: true },
    }),
  ]);

  return (
    <>
      <AppHeader name={user.name} />
      <main className="flex flex-1 flex-col gap-5 px-4 pt-4 pb-4">
        <StatusTiles
          payoutCzk={week.netCzk}
          screenMinutes={czkToMinutes(week.screenTimeCzk, settings.screenTimeHourCostCzk)}
          streakDays={streak?.currentStreak ?? 0}
          bonusCzk={bonus.currentBonusCzk}
          trialEndsOn={
            streak?.trialEndsOn && streak.trialEndsOn >= startOfDayPrague() ? streak.trialEndsOn : null
          }
        />
        <div>{children}</div>
      </main>
    </>
  );
}
