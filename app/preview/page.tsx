import Link from "next/link";
import { ACCENT, Avatar, PEOPLE, TourBar } from "./_shared";

export default function PreviewLogin() {
  return (
    <>
      <TourBar step={1} />
      <main className="flex flex-1 flex-col px-6 pt-10 pb-10">
        <div className="flex flex-col items-center gap-2 pb-10">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.27em]"
            style={{ color: ACCENT }}
          >
            Homeworks
          </span>
          <h1 className="text-[26px] font-semibold tracking-tight">
            Klikni na profil
          </h1>
          <p className="text-[13px] text-zinc-500">
            Každá dlaždice ukáže jinou obrazovku z appky.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3">
          {PEOPLE.map((p) => (
            <li key={p.id}>
              <Link
                href={p.route}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50/40"
              >
                <Avatar person={p} size={48} />
                <div className="flex flex-1 flex-col leading-tight">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[16px] font-semibold text-zinc-900">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      {p.role}
                    </span>
                  </div>
                  <span className="text-[13px] text-zinc-500">{p.blurb}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="pt-8 text-center text-[12px] text-zinc-400">
          PIN se v ukázce neptáme — klikni jakoukoliv dlaždici.
        </p>
      </main>
    </>
  );
}
