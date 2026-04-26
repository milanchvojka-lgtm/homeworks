import { getAppSettings } from "@/lib/credit";
import { SettingsForm } from "./_settings-form";

export default async function AdminSettingsPage() {
  const settings = await getAppSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Nastavení</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Ekonomické parametry. Změny platí okamžitě.
      </p>
      <SettingsForm
        initial={{
          hourlyRateCzk: settings.hourlyRateCzk,
          screenTimeHourCostCzk: settings.screenTimeHourCostCzk,
          screenTimeMinGranularity: settings.screenTimeMinGranularity,
          monthlyBonusCzk: settings.monthlyBonusCzk,
          defaultClaimTimeoutHours: settings.defaultClaimTimeoutHours,
          defaultExecuteTimeoutHours: settings.defaultExecuteTimeoutHours,
        }}
      />
    </div>
  );
}
