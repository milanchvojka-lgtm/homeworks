import { Check, Clock, Sparkles } from "lucide-react";
import {
  ACCENT,
  ACCENT_TINT,
  BottomTabs,
  TopBar,
  funnel,
  newsreader,
} from "../_shared";

type CheckItem = {
  name: string;
  status: "approved" | "submitted" | "pending";
};

const morning: CheckItem[] = [
  { name: "Prázdná myčka", status: "approved" },
  { name: "Čistá linka", status: "submitted" },
];

const evening: CheckItem[] = [
  { name: "Nádobí v myčce", status: "pending" },
  { name: "Utřený sporák", status: "pending" },
  { name: "Vyhozené odpadky", status: "pending" },
];

export default function PreviewDnes() {
  return (
    <main className="flex min-h-screen flex-col">
      <TopBar greeting="Ani" />

      <div className="flex-1 px-6 py-6">
        {/* Hero */}
        <div
          className="mb-6 flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{ backgroundColor: ACCENT_TINT }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: ACCENT }}
          >
            <Sparkles size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className={`${funnel} text-[10px] tracking-[0.2em]`}
              style={{ color: ACCENT }}
            >
              TENTO TÝDEN
            </span>
            <span className={`${newsreader} text-[22px] font-semibold`}>
              Máš na starosti kuchyň
            </span>
          </div>
        </div>

        {/* Bonus banner */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900">
          🎯 <span>Bonus tento měsíc stále ve hře — 200 Kč.</span>
        </div>

        <SectionHeader label="Dnes — středa" />

        <Group title="Ráno" items={morning} />
        <Group title="Večer" items={evening} />

        <p className="pt-4 text-center text-[12px] text-zinc-400">
          Když dnes splníš všechno, odemkne se ti pool extra úkolů.
        </p>
      </div>

      <BottomTabs active="dnes" />
    </main>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        className={`${funnel} text-[11px] font-semibold tracking-[0.25em]`}
        style={{ color: ACCENT }}
      >
        {label.toUpperCase()}
      </span>
      <span className="h-px flex-1 bg-[#EFEFEF]" />
    </div>
  );
}

function Group({ title, items }: { title: string; items: CheckItem[] }) {
  return (
    <div className="mb-6">
      <h3
        className={`${funnel} mb-2 text-[11px] tracking-[0.2em] text-zinc-500`}
      >
        {title.toUpperCase()}
      </h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <CheckRow key={item.name} item={item} />
        ))}
      </ul>
    </div>
  );
}

function CheckRow({ item }: { item: CheckItem }) {
  if (item.status === "approved") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check size={16} strokeWidth={3} />
        </span>
        <span className="flex-1 text-[14px] text-zinc-600 line-through">
          {item.name}
        </span>
        <span
          className={`${funnel} text-[10px] tracking-[0.18em] text-emerald-700`}
        >
          SCHVÁLENO
        </span>
      </li>
    );
  }
  if (item.status === "submitted") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white">
          <Clock size={15} strokeWidth={2.5} />
        </span>
        <span className="flex-1 text-[14px]">{item.name}</span>
        <span
          className={`${funnel} text-[10px] tracking-[0.18em] text-amber-700`}
        >
          ČEKÁ
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[#EFEFEF] px-4 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E5]" />
      <span className="flex-1 text-[14px]">{item.name}</span>
      <button
        className={`${funnel} rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-white`}
        style={{ backgroundColor: ACCENT }}
      >
        HOTOVO
      </button>
    </li>
  );
}
