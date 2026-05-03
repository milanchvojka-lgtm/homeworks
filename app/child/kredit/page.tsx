import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import {
  computeScreenTimeCost,
  getAppSettings,
  getCurrentBalance,
  getWeekTotals,
} from "@/lib/credit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BonusBanner } from "../_components/bonus-banner";
import { ScreenTimeRequester } from "../_components/screen-time-requester";

export default async function ChildCreditPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [balance, weekTotals, settings, pendingRequest, bonusStatus] =
    await Promise.all([
      getCurrentBalance(user.id),
      getWeekTotals(user.id),
      getAppSettings(),
      db.screenTimeRequest.findFirst({
        where: { userId: user.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
      getBonusStatus(user.id),
    ]);

  const offers = [30, 60, 90].map((m) => ({
    minutes: m,
    cost: computeScreenTimeCost(m, settings.screenTimeHourCostCzk),
  }));

  const payout = Math.max(0, weekTotals.earnedCzk - weekTotals.screenTimeCzk);

  return (
    <div className="space-y-3">
      {/* Tento týden */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Tento týden
          </div>
          <div className="mt-3 space-y-1.5">
            <Row label="Vyděláno" value={`${weekTotals.earnedCzk} Kč`} />
            <Row
              label="Vyčerpáno na obrazovku"
              value={`${weekTotals.screenTimeCzk} Kč`}
            />
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">K výplatě</span>
              <span
                className="text-base font-bold tabular-nums"
                style={{ color: "var(--chart-1)" }}
              >
                {payout} Kč
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktuální balanc */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Aktuální balanc
          </div>
          <div
            className="mt-2 text-3xl font-bold tabular-nums"
            style={{ color: "var(--chart-1)" }}
          >
            {balance} Kč
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Suma všech transakcí (vč. minulých týdnů). Z toho si můžeš nechat
            poslat obrazovku.
          </p>
        </CardContent>
      </Card>

      {/* Bonus banner */}
      <BonusBanner status={bonusStatus} amount={settings.monthlyBonusCzk} />

      {/* Chci obrazovku */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Chci obrazovku
          </div>
          {pendingRequest ? (
            <div className="mt-3">
              <Badge variant="secondary" className="mb-2">
                Čeká na schválení
              </Badge>
              <p className="text-sm text-muted-foreground">
                Žádost o {pendingRequest.minutes} min ({pendingRequest.costCzk}{" "}
                Kč) čeká na schválení.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <ScreenTimeRequester offers={offers} balance={balance} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historie link */}
      <div className="px-1">
        <Link
          href="/child/historie"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Historie minulých týdnů →
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
