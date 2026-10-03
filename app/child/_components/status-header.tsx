import Link from "next/link";
import { ChevronRight, Flame, Wallet } from "lucide-react";
import { formatCzk, formatDayPrague, formatMinutes } from "./format";

/**
 * Status tiles, first thing in a tab's content (pen `StatusTiles`): this week's payout + screen time,
 * streak + bonus. The only place these numbers live on a tab.
 */
export function StatusTiles({
  payoutCzk,
  screenMinutes,
  streakDays,
  bonusCzk,
  trialEndsOn,
}: {
  /** D30: may be negative (screen time recorded without credit), then red. */
  payoutCzk: number;
  screenMinutes: number;
  streakDays: number;
  bonusCzk: number;
  /** D25: during the trial week the tile says until when instead of the bonus. */
  trialEndsOn?: Date | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Tile
        href="/child/vypis"
        icon={<Wallet className="size-3.5" />}
        kicker="Tento týden"
        value={formatCzk(payoutCzk)}
        valueClass={payoutCzk < 0 ? "text-destructive" : "text-highlight"}
        sub={`Screen time: ${formatMinutes(screenMinutes)}`}
      />
      <Tile
        href="/child/ja"
        icon={<Flame className="size-3.5" />}
        kicker="Řada"
        value={`${streakDays} ${daysLabel(streakDays)}`}
        valueClass="text-foreground"
        sub={trialEndsOn ? `Zkouška do ${formatDayPrague(trialEndsOn)}` : `Bonus +${bonusCzk} Kč`}
      />
    </div>
  );
}

function Tile({
  href,
  icon,
  kicker,
  value,
  valueClass,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  kicker: string;
  value: string;
  valueClass: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5 transition-colors active:bg-muted"
    >
      <span className="flex items-center gap-1.5 text-subtle">
        {icon}
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
          {kicker}
        </span>
        <ChevronRight className="ml-auto size-3.5" />
      </span>
      <span className={`font-mono text-[26px] font-bold leading-tight ${valueClass}`}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{sub}</span>
    </Link>
  );
}

function daysLabel(n: number): string {
  if (n === 1) return "den";
  if (n >= 2 && n <= 4) return "dny";
  return "dní";
}
