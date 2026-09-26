import { redirect } from "next/navigation";
import { Hourglass, Send, X } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeScreenTimeCost, getAppSettings, getCurrentBalance } from "@/lib/credit";
import { affordableMinutes, formatMinutes, formatTimePrague } from "../../_components/format";
import { ScreenPicker } from "./_screen-picker";

const REJECTED_NOTICE_MS = 24 * 60 * 60 * 1000;

/** Obrazovka (návrh 2, frames 03, 03b, 03c). */
export default async function ChildScreenPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [balance, settings, lastRequest] = await Promise.all([
    getCurrentBalance(user.id),
    getAppSettings(),
    db.screenTimeRequest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const minutes = affordableMinutes(
    balance,
    settings.screenTimeHourCostCzk,
    settings.screenTimeMinGranularity,
  );
  const minutesCost = computeScreenTimeCost(minutes, settings.screenTimeHourCostCzk);
  const offers = [30, 60, 90].map((m) => {
    const cost = computeScreenTimeCost(m, settings.screenTimeHourCostCzk);
    return { minutes: m, cost, affordable: balance >= cost };
  });

  const now = new Date();
  const pending = lastRequest?.status === "PENDING" ? lastRequest : null;
  // D3: a rejection used to vanish silently; show it until the next request or for a day.
  const rejected =
    lastRequest?.status === "REJECTED" &&
    lastRequest.reviewedAt &&
    now.getTime() - lastRequest.reviewedAt.getTime() < REJECTED_NOTICE_MS
      ? lastRequest
      : null;

  return (
    <div className="flex flex-col gap-3">
      {rejected && (
        <div className="flex items-center gap-3 rounded-2xl bg-danger-soft px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card">
            <X className="size-[18px] text-destructive" />
          </span>
          <div>
            <p className="font-semibold">Rodič žádost o {rejected.minutes} min zamítl</p>
            <p className="text-sm text-muted-foreground">Kredit ti zůstal. Můžeš požádat znovu.</p>
          </div>
        </div>
      )}

      <section className="flex flex-col items-center gap-1 rounded-tile border border-border bg-card px-[18px] py-5">
        <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
          Můžeš si zahrát
        </span>
        <span className="font-mono text-[34px] font-bold text-highlight">
          {formatMinutes(minutes)}
        </span>
        <span className="text-sm text-muted-foreground">
          {minutes > 0 ? `za ${minutesCost} Kč z tvého kreditu` : `máš ${balance} Kč kreditu`}
        </span>
      </section>

      {pending ? (
        <section className="flex flex-col gap-3 rounded-tile border border-border bg-card p-[18px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
              Žádost
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground">
              <Send className="size-3.5" />
              odesláno {formatTimePrague(pending.createdAt)}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {pending.minutes} min za {pending.costCzk} Kč
          </h2>
          <div className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-warning-soft font-semibold text-warning">
            <Hourglass className="size-[18px]" />
            Čeká na rodiče
          </div>
          <p className="text-sm text-muted-foreground">Kredit se odečte, až žádost schválí.</p>
        </section>
      ) : (
        <ScreenPicker offers={offers} />
      )}
    </div>
  );
}
