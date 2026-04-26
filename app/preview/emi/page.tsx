import { Lock, Timer } from "lucide-react";
import {
  ACCENT,
  ItemCard,
  KidHero,
  KidTabs,
  ProfileBar,
  SectionTitle,
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
        <KidHero
          eyebrow="Tento týden"
          title="Obývák"
          description="Vše dnes hotovo · pool extra úkolů odemčený"
          meta="Středa, 24. 4."
          tone="success"
        />

        <SectionTitle>Můžu vzít teď</SectionTitle>
        <ul className="mb-5 flex flex-col gap-3">
          {available.map((task) => (
            <ItemCard key={task.name} variant="active">
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
            </ItemCard>
          ))}
        </ul>

        <SectionTitle>Mé úkoly · rozpracované</SectionTitle>
        <ul className="mb-5 flex flex-col gap-3">
          {myActive.map((task) => (
            <ItemCard key={task.name} variant="active">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                <Timer size={11} />
                <span>Aktivní · {task.deadline}</span>
              </div>
              <div className="mt-1 flex items-start justify-between gap-4">
                <h3 className="text-[18px] font-semibold leading-tight">
                  {task.name}
                </h3>
                <span
                  className="shrink-0 text-[22px] font-semibold"
                  style={{ color: ACCENT }}
                >
                  {task.price}&nbsp;Kč
                </span>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-lg py-2 text-[13px] font-semibold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Hotovo, nahlásit ke schválení
              </button>
            </ItemCard>
          ))}
        </ul>

        <SectionTitle>Zamčeno</SectionTitle>
        <ul className="flex flex-col gap-3">
          {locked.map((task) => (
            <ItemCard key={task.name} variant="locked">
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
            </ItemCard>
          ))}
        </ul>
      </main>
      <KidTabs active="pool" />
    </>
  );
}
