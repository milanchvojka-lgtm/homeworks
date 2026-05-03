import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import { getAppSettings } from "@/lib/credit";
import { getCurrentAssignment } from "@/lib/rotation";
import { startOfDayPrague } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { BonusBanner } from "./_components/bonus-banner";
import { TodayChecks } from "./_components/today-checks";

export default async function ChildToday() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const [assignment, instances, bonusStatus, settings] = await Promise.all([
    getCurrentAssignment(user.id),
    db.dailyCheckInstance.findMany({
      where: { userId: user.id, date: today },
      include: { dailyCheck: true },
      orderBy: [{ dailyCheck: { order: "asc" } }],
    }),
    getBonusStatus(user.id),
    getAppSettings(),
  ]);

  return (
    <div className="space-y-3">
      <BonusBanner status={bonusStatus} amount={settings.monthlyBonusCzk} />

      {/* Current competency */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Aktuální kompetence
          </div>
          {assignment ? (
            <div className="mt-1 text-sm font-semibold tracking-tight">
              {assignment.competency.name}
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">
              Tento týden nemáš přiřazenou kompetenci.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today checks */}
      {instances.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Žádné checky pro dnešek. Zkontroluj to později.
            </p>
          </CardContent>
        </Card>
      ) : (
        <TodayChecks
          instances={instances.map((i) => ({
            id: i.id,
            name: i.dailyCheck.name,
            timeOfDay: i.dailyCheck.timeOfDay,
            status: i.status,
            note: i.note,
          }))}
        />
      )}
    </div>
  );
}
