import { Check, Lock, Timer } from "lucide-react";
import {
  ACCENT,
  KidTabs,
  ProfileBar,
  TourBar,
} from "../_shared";

const available = [
  {
    name: "Vyklidit půdu",
    description: "Krabice po Vánocích, srovnat na hromady, ostatní vyhodit.",
    price: 250,
    expiresInHours: 18,
  },
];

const locked = [
  {
    name: "Mytí auta",
    price: 150,
    lockedFor: "Ani",
    unlockAt: "zítra v 8:00",
  },
  {
    name: "Posekání trávníku",
    price: 200,
    lockedFor: "Neli",
    unlockAt: "v sobotu",
  },
];

const myActive = [
  {
    name: "Vyklidit garáž",
    price: 200,
    deadline: "do 18:00 (zbývají 2 h)",
  },
];

export default function EmiPool() {
  return (
    <>
      <TourBar step={3} />
      <ProfileBar personId="emi" />
      <main className="flex-1 px-5 py-5">
        {/* Status hero */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-[13px] text-emerald-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={18} strokeWidth={3} />
          </span>
          <span>
            <strong className="font-semibold">Obývák — vše dnes hotovo.</strong>
            <br />
            Pool extra úkolů je pro tebe odemčený.
          </span>
        </div>

        {/* Můžu vzít teď */}
        <SectionHeader label="Můžu vzít teď" tint={ACCENT} />
        <ul className="mb-6 flex flex-col gap-3">
          {available.map((task) => (
            <li
              key={task.name}
              className="rounded-2xl border-2 border-orange-300 bg-orange-50/50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[18px] font-semibold leading-tight">
                    {task.name}
                  </h3>
                  <p className="text-[13px] text-zinc-600">
                    {task.description}
                  </p>
                </div>
                <span
                  className="shrink-0 text-[22px] font-semibold"
                  style={{ color: ACCENT }}
                >
                  {task.price}&nbsp;Kč
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  <Timer size={12} />
                  Propadne za {task.expiresInHours} h
                </span>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Vzít si
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Mé úkoly */}
        <SectionHeader label="Mé úkoly · rozpracované" />
        <ul className="mb-6 flex flex-col gap-3">
          {myActive.map((task) => (
            <li
              key={task.name}
              className="rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[16px] font-semibold leading-tight">
                    {task.name}
                  </h3>
                  <p className="mt-1 text-[12px] text-zinc-400">
                    {task.deadline}
                  </p>
                </div>
                <span
                  className="shrink-0 text-[18px] font-semibold"
                  style={{ color: "#FF8533" }}
                >
                  {task.price}&nbsp;Kč
                </span>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-zinc-900"
              >
                Hotovo, nahlásit ke schválení
              </button>
            </li>
          ))}
        </ul>

        {/* Locked */}
        <SectionHeader label="Zamčeno" />
        <ul className="flex flex-col gap-3">
          {locked.map((task) => (
            <li
              key={task.name}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 opacity-80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-semibold leading-tight">
                    {task.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[12px] text-zinc-500">
                    <Lock size={12} /> Rezervováno pro {task.lockedFor} —
                    k&nbsp;dispozici&nbsp;{task.unlockAt}, pokud si to
                    nevezme.
                  </p>
                </div>
                <span className="shrink-0 text-[15px] font-semibold text-zinc-400">
                  {task.price}&nbsp;Kč
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <KidTabs active="pool" />
    </>
  );
}

function SectionHeader({ label, tint = "#71717A" }: { label: string; tint?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: tint }}
      >
        {label}
      </span>
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}
