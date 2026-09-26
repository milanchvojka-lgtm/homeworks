import Link from "next/link";
import { ChevronRight, Flame, Wallet } from "lucide-react";
import { formatMinutes } from "./format";

/**
 * App header on every child tab (header C6, iteration 8; pen `AppHeader C6`): quiet white bar with
 * wordmark + greeting so attention stays on the content below.
 */
export function AppHeader({ name }: { name: string }) {
  return (
    <header className="border-b border-border bg-card px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[18px]">
      <p className="font-mono text-[11px] font-bold tracking-[0.18em]">HOMEWORKS</p>
      <h1 className="mt-0.5 text-[26px] font-bold tracking-tight">Ahoj, {name} 👋</h1>
    </header>
  );
}

/**
 * Status tiles, first thing in a tab's content (pen `StatusTiles`): this week's payout + screen time,
 * streak + bonus. The only place these numbers live on a tab.
 */
export function StatusTiles({
  payoutCzk,
  screenMinutes,
  streakDays,
  bonusCzk,
}: {
  payoutCzk: number;
  screenMinutes: number;
  streakDays: number;
  bonusCzk: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Tile
        href="/child/vypis"
        icon={<Wallet className="size-3.5" />}
        kicker="Tento týden"
        value={`${payoutCzk} Kč`}
        valueClass="text-highlight"
        sub={`Screen time: ${formatMinutes(screenMinutes)}`}
      />
      <Tile
        href="/child/ja"
        icon={<Flame className="size-3.5" />}
        kicker="Řada"
        value={`${streakDays} ${daysLabel(streakDays)}`}
        valueClass="text-foreground"
        sub={`Bonus +${bonusCzk} Kč`}
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
