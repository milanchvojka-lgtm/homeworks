import { db } from "@/lib/db";
import { getAppSettings } from "@/lib/credit";
import { SettingsForm } from "./_settings-form";
import { MilestonesForm } from "./_milestones-form";
import { AdminSubpage } from "../_components/subpage";

export default async function AdminSettingsPage() {
  const [settings, milestones] = await Promise.all([
    getAppSettings(),
    db.streakMilestone.findMany({
      orderBy: [{ sortOrder: "asc" }, { days: "asc" }],
    }),
  ]);

  return (
    <AdminSubpage title="Nastavení" back="/admin/vic">
      <p className="text-sm text-muted-foreground">Ekonomické parametry. Změny platí okamžitě.</p>

      <SettingsForm
        initial={{
          hourlyRateCzk: settings.hourlyRateCzk,
          screenTimeHourCostCzk: settings.screenTimeHourCostCzk,
          screenTimeMinGranularity: settings.screenTimeMinGranularity,
          monthlyBonusCzk: settings.monthlyBonusCzk,
          monthlyBonusStepCzk: settings.monthlyBonusStepCzk,
          defaultClaimTimeoutHours: settings.defaultClaimTimeoutHours,
          defaultExecuteTimeoutHours: settings.defaultExecuteTimeoutHours,
          welcomeBonusCzk: settings.welcomeBonusCzk,
        }}
      />

      <MilestonesForm milestones={milestones} />
    </AdminSubpage>
  );
}
