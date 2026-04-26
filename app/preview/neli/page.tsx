import { Monitor } from "lucide-react";
import {
  ACCENT,
  KidTabs,
  ProfileBar,
  TourBar,
} from "../_shared";

const thisWeek = [
  { name: "Koupelna · pondělí", amount: 30 },
  { name: "Koupelna · úterý", amount: 20 },
];

const history = [
  {
    week: "14. – 20. 4.",
    earned: 320,
    screenTime: 100,
    payout: 220,
    paidOut: true,
  },
  {
    week: "7. – 13. 4.",
    earned: 280,
    screenTime: 200,
    payout: 80,
    paidOut: true,
  },
];

export default function NeliKredit() {
  const earned = thisWeek.reduce((acc, t) => acc + t.amount, 0);
  const balance = earned;

  return (
    <>
      <TourBar step={4} />
      <ProfileBar personId="neli" />
      <main className="flex-1 px-5 py-5">
        {/* Balance card */}
        <div className="mb-4 rounded-3xl bg-zinc-900 px-6 py-6 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.27em] opacity-70">
            K výplatě tento týden
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className="text-[52px] font-semibold leading-none"
              style={{ color: ACCENT }}
            >
              {balance}
            </span>
            <span className="text-[20px] font-semibold">Kč</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider opacity-60">
                Vyděláno
              </div>
              <div className="font-semibold">{earned} Kč</div>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider opacity-60">
                Obrazovka
              </div>
              <div className="font-semibold">0 Kč</div>
            </div>
          </div>
        </div>

        {/* Bonus lost banner */}
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-900">
          <div className="flex items-start gap-2">
            <span className="text-[16px]">😞</span>
            <div>
              <div className="font-semibold">
                Bonus tento měsíc už nedosažitelný.
              </div>
              <div className="text-[12px] opacity-80">
                Zaváhala ve čtvrtek 24. 4. — 1 propadlý check.
              </div>
            </div>
          </div>
        </div>

        {/* Disabled CTA */}
        <button
          type="button"
          disabled
          className="mb-6 flex w-full cursor-not-allowed items-center justify-between rounded-2xl border-2 border-zinc-200 bg-zinc-100 px-5 py-4 text-zinc-400"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200">
              <Monitor size={18} strokeWidth={2.25} />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[16px] font-semibold">
                Chci obrazovku
              </span>
              <span className="text-[11px]">
                Potřebuješ aspoň 100 Kč
              </span>
            </span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
            Disabled
          </span>
        </button>

        <SectionLabel>Tento týden</SectionLabel>
        <ul className="mb-6 flex flex-col">
          {thisWeek.map((tx, i) => (
            <li
              key={i}
              className="flex items-center justify-between border-b border-zinc-100 py-3 text-[14px] last:border-0"
            >
              <span className="text-zinc-700">{tx.name}</span>
              <span className="font-semibold text-zinc-900">
                +{tx.amount}&nbsp;Kč
              </span>
            </li>
          ))}
        </ul>

        <SectionLabel>Historie</SectionLabel>
        <ul className="flex flex-col gap-2">
          {history.map((w) => (
            <li
              key={w.week}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold">{w.week}</span>
                <span className="text-[11px] text-zinc-500">
                  Vyděláno {w.earned} Kč · obrazovka {w.screenTime} Kč
                </span>
              </div>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[15px] font-semibold">
                  {w.payout}&nbsp;Kč
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
                  Vyplaceno
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <KidTabs active="kredit" />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
      {children}
    </h2>
  );
}
