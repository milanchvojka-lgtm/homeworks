import { Monitor, ArrowRight } from "lucide-react";
import {
  ACCENT,
  ACCENT_TINT,
  BottomTabs,
  TopBar,
  funnel,
  newsreader,
} from "../_shared";

const TRANSACTIONS = [
  { name: "Kuchyň · pondělí", amount: 40 },
  { name: "Kuchyň · úterý", amount: 40 },
  { name: "Vyklidit garáž", amount: 200 },
  { name: "Kuchyň · středa (zatím)", amount: 100 },
  { name: "Obrazovka 30 min", amount: -100 },
];

export default function PreviewKredit() {
  const earned = TRANSACTIONS.filter((t) => t.amount > 0).reduce(
    (acc, t) => acc + t.amount,
    0,
  );
  const spent = -TRANSACTIONS.filter((t) => t.amount < 0).reduce(
    (acc, t) => acc + t.amount,
    0,
  );
  const balance = earned - spent;

  return (
    <main className="flex min-h-screen flex-col">
      <TopBar greeting="Ani" />

      <div className="flex-1 px-6 py-6">
        {/* Big balance card */}
        <div
          className="mb-5 rounded-3xl px-6 py-7 text-white"
          style={{ backgroundColor: "#1A1A1A" }}
        >
          <span
            className={`${funnel} text-[10px] tracking-[0.27em] opacity-70`}
          >
            K VÝPLATĚ TENTO TÝDEN
          </span>
          <div
            className={`${newsreader} mt-2 flex items-baseline gap-2 font-semibold`}
          >
            <span className="text-[56px] leading-none" style={{ color: ACCENT }}>
              {balance}
            </span>
            <span className="text-[24px]">Kč</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <div className="flex flex-col rounded-xl bg-white/10 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                Vyděláno
              </span>
              <span className="font-semibold">{earned} Kč</span>
            </div>
            <div className="flex flex-col rounded-xl bg-white/10 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                Obrazovka
              </span>
              <span className="font-semibold">−{spent} Kč</span>
            </div>
          </div>
        </div>

        {/* Bonus */}
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900">
          🎯 <span>Bonus tento měsíc stále ve hře — 200 Kč.</span>
        </div>

        {/* Screen time CTA */}
        <button
          className="mb-7 flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 transition hover:bg-orange-50/30"
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          <span className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: ACCENT_TINT }}
            >
              <Monitor size={18} color={ACCENT} strokeWidth={2.25} />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span
                className={`${newsreader} text-[18px] font-semibold`}
              >
                Chci obrazovku
              </span>
              <span className="text-[12px] text-zinc-500">
                100 Kč&nbsp;=&nbsp;30 min · 200 Kč&nbsp;=&nbsp;1 h
              </span>
            </span>
          </span>
          <ArrowRight size={18} />
        </button>

        <h2
          className={`${funnel} mb-3 text-[11px] tracking-[0.22em] text-zinc-500`}
        >
          TENTO TÝDEN
        </h2>
        <ul className="flex flex-col">
          {TRANSACTIONS.map((tx, i) => (
            <li
              key={i}
              className="flex items-center justify-between border-b border-[#F4F4F4] py-3 text-[14px] last:border-0"
            >
              <span className="text-zinc-700">{tx.name}</span>
              <span
                className={`${newsreader} font-semibold ${
                  tx.amount > 0 ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}&nbsp;Kč
              </span>
            </li>
          ))}
        </ul>
      </div>

      <BottomTabs active="kredit" />
    </main>
  );
}
