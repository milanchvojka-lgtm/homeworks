import { Check, Clock, Lock } from "lucide-react";
import {
  ACCENT,
  ItemCard,
  KidHero,
  KidTabs,
  ProfileBar,
  SectionTitle,
  TourBar,
} from "../_shared";

type Status = "approved" | "submitted" | "pending";

const morning: { name: string; status: Status }[] = [
  { name: "Prázdná myčka", status: "approved" },
  { name: "Čistá linka", status: "submitted" },
];

const evening: { name: string; status: Status }[] = [
  { name: "Nádobí v myčce", status: "pending" },
  { name: "Utřený sporák", status: "pending" },
  { name: "Vyhozené odpadky", status: "pending" },
];

export default function AniDnes() {
  return (
    <>
      <TourBar step={2} />
      <ProfileBar personId="ani" />
      <main className="flex-1 px-5 py-5">
        <KidHero
          eyebrow="Tento týden"
          title="Kuchyň"
          description="2 hotové · 3 zbývají"
          meta="Středa, 24. 4."
          progress={40}
        />

        {/* Bonus dashboard */}
        <BonusCalendar today={24} totalDays={30} />

        <SectionTitle>Ráno</SectionTitle>
        <ul className="mb-5 flex flex-col gap-2">
          {morning.map((it) => (
            <CheckRow key={it.name} {...it} />
          ))}
        </ul>

        <SectionTitle>Večer</SectionTitle>
        <ul className="mb-5 flex flex-col gap-2">
          {evening.map((it) => (
            <CheckRow key={it.name} {...it} />
          ))}
        </ul>

        <SectionTitle>Pool extra úkolů</SectionTitle>
        <p className="mb-3 flex items-center gap-2 text-[12px] text-zinc-500">
          <Lock size={12} />
          Splň zbývající 3 checky a pool se odemkne.
        </p>
        <ItemCard variant="locked">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-[16px] font-semibold leading-tight text-zinc-700">
                Vyklidit půdu
              </h3>
              <p className="text-[12px] text-zinc-500">
                Krabice po Vánocích, srovnat na hromady, ostatní vyhodit.
              </p>
            </div>
            <span className="shrink-0 text-[18px] font-semibold text-zinc-400">
              250&nbsp;Kč
            </span>
          </div>
          <button
            type="button"
            disabled
            className="mt-3 w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-white py-2 text-[12px] font-semibold text-zinc-400"
          >
            🔒 Zamčeno · dokonči checky
          </button>
        </ItemCard>
      </main>
      <KidTabs active="dnes" />
    </>
  );
}

function BonusCalendar({
  today,
  totalDays,
}: {
  today: number;
  totalDays: number;
}) {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const completed = today - 1;
  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
          🎯 Bonus na dosah
        </span>
        <span className="text-[20px] font-semibold text-amber-900">
          200&nbsp;Kč
        </span>
      </div>
      <p className="mt-1 text-[12px] text-amber-900">
        Den <strong className="font-semibold">{today}</strong> z {totalDays} ·
        zatím bez zaváhání. Drž se zbylých {totalDays - completed - 1}.
      </p>
      <div className="mt-3 grid grid-cols-6 gap-1.5">
        {days.map((d) => {
          if (d < today) {
            return (
              <span
                key={d}
                className="flex aspect-square items-center justify-center rounded-md bg-emerald-500 text-white"
              >
                <Check size={12} strokeWidth={3} />
              </span>
            );
          }
          if (d === today) {
            return (
              <span
                key={d}
                className="flex aspect-square items-center justify-center rounded-md text-[11px] font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {d}
              </span>
            );
          }
          return (
            <span
              key={d}
              className="flex aspect-square items-center justify-center rounded-md bg-white text-[11px] font-medium text-zinc-300"
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CheckRow({ name, status }: { name: string; status: Status }) {
  if (status === "approved") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check size={16} strokeWidth={3} />
        </span>
        <span className="flex-1 text-[14px] text-zinc-500 line-through">
          {name}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
          Schváleno
        </span>
      </li>
    );
  }
  if (status === "submitted") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white">
          <Clock size={15} strokeWidth={2.5} />
        </span>
        <span className="flex-1 text-[14px]">{name}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700">
          Čeká
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-200" />
      <span className="flex-1 text-[14px]">{name}</span>
      <button
        type="button"
        className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white"
        style={{ backgroundColor: ACCENT }}
      >
        Hotovo
      </button>
    </li>
  );
}
