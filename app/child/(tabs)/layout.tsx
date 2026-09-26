import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import { getAppSettings, getWeekTotals } from "@/lib/credit";
import { StatusHeader } from "../_components/status-header";
import { czkToMinutes } from "../_components/format";

/** Tabs (Dnes, Vydělat, Obrazovka, Já + their subpages) carry the status header. */
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
      <StatusHeader
        payoutCzk={Math.max(0, week.earnedCzk - week.screenTimeCzk)}
        screenMinutes={czkToMinutes(
          week.screenTimeCzk,
          settings.screenTimeHourCostCzk,
        )}
        streakDays={streak?.currentStreak ?? 0}
        bonusCzk={bonus.currentBonusCzk}
      />
      <main className="flex-1 px-4 pt-5 pb-4">{children}</main>
    </>
  );
}
