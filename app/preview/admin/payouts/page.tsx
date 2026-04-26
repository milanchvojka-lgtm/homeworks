import { Sparkles } from "lucide-react";
import {
  ACCENT,
  AdminTabs,
  Avatar,
  PEOPLE,
  ProfileBar,
  TourBar,
} from "../../_shared";

type Row = {
  childId: "ani" | "emi" | "neli";
  earned: number;
  screenTime: number;
  bonus: number;
  bonusReason?: string;
};

const rows: Row[] = [
  {
    childId: "ani",
    earned: 380,
    screenTime: 100,
    bonus: 200,
    bonusReason: "perfektní měsíc",
  },
  { childId: "emi", earned: 200, screenTime: 50, bonus: 0 },
  { childId: "neli", earned: 50, screenTime: 0, bonus: 0 },
];

export default function AdminPayouts() {
  return (
    <>
      <TourBar step={6} />
      <ProfileBar personId="teri" />
      <main className="flex-1 px-5 py-5">
        {/* Header */}
        <div className="mb-1 flex items-baseline justify-between">
          <h1 className="text-[24px] font-semibold tracking-tight">
            Týdenní výplata
          </h1>
        </div>
        <p className="mb-5 text-[12px] text-zinc-500">
          21. 4. – 27. 4. · Neděle 22:00 · Konec dubna — měsíční bonus se
          připisuje do tohoto týdne.
        </p>

        {/* Summary card */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Celkem k výplatě
            </div>
            <div className="mt-1 text-[22px] font-semibold">
              {rows.reduce(
                (a, r) => a + (r.earned - r.screenTime + r.bonus),
                0,
              )}{" "}
              Kč
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Bonusy
            </div>
            <div className="mt-1 text-[22px] font-semibold">
              {rows.reduce((a, r) => a + r.bonus, 0)} Kč
            </div>
          </div>
        </div>

        {/* Per-child rows */}
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <PayoutRow key={r.childId} row={r} />
          ))}
        </ul>
      </main>
      <AdminTabs active="payouts" />
    </>
  );
}

function PayoutRow({ row }: { row: Row }) {
  const person = PEOPLE.find((p) => p.id === row.childId)!;
  const total = row.earned - row.screenTime + row.bonus;
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4">
      <header className="flex items-center gap-3">
        <Avatar person={person} size={36} />
        <span className="flex-1 text-[16px] font-semibold">{person.name}</span>
        <span className="text-[20px] font-semibold" style={{ color: ACCENT }}>
          {total}&nbsp;Kč
        </span>
      </header>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
        <BreakdownCell label="Vyděláno" value={`+${row.earned} Kč`} />
        <BreakdownCell
          label="Obrazovka"
          value={row.screenTime ? `−${row.screenTime} Kč` : "0 Kč"}
        />
        <BreakdownCell
          label="Bonus"
          value={row.bonus ? `+${row.bonus} Kč` : "0 Kč"}
          highlight={row.bonus > 0}
        />
      </div>
      {row.bonus > 0 && row.bonusReason && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          <Sparkles size={14} />
          <span>
            <strong className="font-semibold">Měsíční bonus 200 Kč</strong> —{" "}
            {row.bonusReason}.
          </span>
        </div>
      )}
      <button
        type="button"
        className="mt-3 w-full rounded-lg bg-zinc-900 py-2 text-[13px] font-semibold text-white"
      >
        Vyplaceno
      </button>
    </li>
  );
}

function BreakdownCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-2 py-2 ${
        highlight ? "border-amber-200 bg-amber-50" : "border-zinc-100 bg-zinc-50"
      }`}
    >
      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-semibold">{value}</div>
    </div>
  );
}
