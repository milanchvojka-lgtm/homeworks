import { Lock, Timer } from "lucide-react";
import {
  ACCENT,
  BottomTabs,
  TopBar,
  funnel,
  newsreader,
} from "../_shared";

type Available = {
  kind: "available";
  name: string;
  description: string;
  price: number;
  expiresInHours: number;
};
type Locked = {
  kind: "locked";
  name: string;
  price: number;
  lockedFor: string;
  unlockAt: string;
};

const available: Available[] = [
  {
    kind: "available",
    name: "Vyklidit půdu",
    description: "Krabice po Vánocích, srovnat na hromady, ostatní vyhodit.",
    price: 250,
    expiresInHours: 18,
  },
];

const locked: Locked[] = [
  {
    kind: "locked",
    name: "Mytí auta",
    price: 150,
    lockedFor: "Emma",
    unlockAt: "zítra v 8:00",
  },
  {
    kind: "locked",
    name: "Posekání trávníku",
    price: 200,
    lockedFor: "Klára",
    unlockAt: "v sobotu",
  },
];

export default function PreviewPool() {
  return (
    <main className="flex min-h-screen flex-col">
      <TopBar greeting="Anička" />

      <div className="flex-1 px-6 py-6">
        <h1 className={`${newsreader} mb-1 text-[28px] font-semibold`}>
          Pool extra úkolů
        </h1>
        <p className="mb-6 text-[13px] text-zinc-500">
          Větší práce, za které jsou peníze. Chytni to dřív než sourozenka.
        </p>

        <SectionLabel text="Můžu vzít teď" tint={ACCENT} />
        <ul className="mb-6 flex flex-col gap-3">
          {available.map((task) => (
            <AvailableCard key={task.name} task={task} />
          ))}
        </ul>

        <SectionLabel text="Zamčeno (čeká na sourozenku)" tint="#888" />
        <ul className="flex flex-col gap-3">
          {locked.map((task) => (
            <LockedCard key={task.name} task={task} />
          ))}
        </ul>
      </div>

      <BottomTabs active="pool" />
    </main>
  );
}

function SectionLabel({ text, tint }: { text: string; tint: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        className={`${funnel} text-[11px] font-semibold tracking-[0.22em]`}
        style={{ color: tint }}
      >
        {text.toUpperCase()}
      </span>
      <span className="h-px flex-1 bg-[#EFEFEF]" />
    </div>
  );
}

function AvailableCard({ task }: { task: Available }) {
  return (
    <li className="rounded-2xl border-2 border-orange-200 bg-orange-50/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className={`${newsreader} text-[20px] font-semibold leading-tight`}>
            {task.name}
          </h3>
          <p className="text-[13px] text-zinc-600">{task.description}</p>
        </div>
        <span
          className={`${newsreader} shrink-0 text-[24px] font-semibold`}
          style={{ color: ACCENT }}
        >
          {task.price}&nbsp;Kč
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`${funnel} flex items-center gap-1 text-[11px] tracking-[0.15em] text-zinc-500`}
        >
          <Timer size={12} />
          PROPADNE ZA {task.expiresInHours} H
        </span>
        <button
          className={`${funnel} rounded-full px-5 py-2 text-[12px] font-semibold tracking-[0.15em] text-white`}
          style={{ backgroundColor: ACCENT }}
        >
          VZÍT SI
        </button>
      </div>
    </li>
  );
}

function LockedCard({ task }: { task: Locked }) {
  return (
    <li className="rounded-2xl border border-[#EFEFEF] bg-zinc-50/50 p-4 opacity-80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className={`${newsreader} text-[18px] font-semibold leading-tight`}>
            {task.name}
          </h3>
          <p className="flex items-center gap-1 text-[12px] text-zinc-500">
            <Lock size={12} /> Zamčeno pro {task.lockedFor} do{" "}
            {task.unlockAt}.
          </p>
        </div>
        <span className="shrink-0 text-[18px] font-semibold text-zinc-400">
          {task.price}&nbsp;Kč
        </span>
      </div>
    </li>
  );
}
