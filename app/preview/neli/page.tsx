import { Monitor } from "lucide-react";
import {
  ItemCard,
  KidHero,
  KidTabs,
  ProfileBar,
  SectionTitle,
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
        <KidHero
          eyebrow="K výplatě tento týden"
          title={`${balance} Kč`}
          description={`Vyděláno +${earned} Kč · obrazovka 0 Kč`}
        />

        {/* Bonus lost banner */}
        <ItemCard variant="warning" className="!border-rose-200 !bg-rose-50">
          <div className="flex items-start gap-2">
            <span className="text-[16px]">😞</span>
            <div>
              <div className="text-[14px] font-semibold text-rose-900">
                Bonus tento měsíc už nedosažitelný.
              </div>
              <div className="text-[12px] text-rose-800/80">
                Zaváhala ve čtvrtek 24. 4. — 1 propadlý check.
              </div>
            </div>
          </div>
        </ItemCard>

        {/* Disabled CTA */}
        <button
          type="button"
          disabled
          className="my-5 flex w-full cursor-not-allowed items-center justify-between rounded-2xl border-2 border-zinc-200 bg-zinc-100 px-5 py-4 text-zinc-400"
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

        <SectionTitle>Tento týden</SectionTitle>
        <ItemCard className="mb-5 !p-0">
          <ul className="flex flex-col">
            {thisWeek.map((tx, i) => (
              <li
                key={i}
                className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-[14px] last:border-0"
              >
                <span className="text-zinc-700">{tx.name}</span>
                <span className="font-semibold text-zinc-900">
                  +{tx.amount}&nbsp;Kč
                </span>
              </li>
            ))}
          </ul>
        </ItemCard>

        <SectionTitle>Historie</SectionTitle>
        <ul className="flex flex-col gap-2">
          {history.map((w) => (
            <ItemCard key={w.week}>
              <div className="flex items-center justify-between">
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
              </div>
            </ItemCard>
          ))}
        </ul>
      </main>
      <KidTabs active="kredit" />
    </>
  );
}
