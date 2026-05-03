import { db } from "@/lib/db";
import { getAppSettings } from "@/lib/credit";
import { SettingsForm } from "./_settings-form";
import { MilestonesForm } from "./_milestones-form";

export default async function AdminSettingsPage() {
  const [settings, milestones] = await Promise.all([
    getAppSettings(),
    db.streakMilestone.findMany({
      orderBy: [{ sortOrder: "asc" }, { days: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nastavení</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ekonomické parametry. Změny platí okamžitě.
        </p>
      </div>

      <SettingsForm
        initial={{
          hourlyRateCzk: settings.hourlyRateCzk,
          screenTimeHourCostCzk: settings.screenTimeHourCostCzk,
          screenTimeMinGranularity: settings.screenTimeMinGranularity,
          monthlyBonusCzk: settings.monthlyBonusCzk,
          monthlyBonusStepCzk: settings.monthlyBonusStepCzk,
          defaultClaimTimeoutHours: settings.defaultClaimTimeoutHours,
          defaultExecuteTimeoutHours: settings.defaultExecuteTimeoutHours,
        }}
      />

      <MilestonesForm milestones={milestones} />
    </div>
  );
}
