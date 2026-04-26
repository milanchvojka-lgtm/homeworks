import Link from "next/link";
import { ACCENT, PEOPLE, funnel, newsreader } from "./_shared";

export default function PreviewLogin() {
  return (
    <main className="flex min-h-[80vh] flex-col px-6 pt-16 pb-10">
      <div className="flex flex-col items-center gap-2 pb-12">
        <span
          className={`${funnel} text-[11px] font-semibold tracking-[0.27em]`}
          style={{ color: ACCENT }}
        >
          HOMEWORKS
        </span>
        <h1 className={`${newsreader} text-[28px] font-semibold`}>
          Klikni na svůj profil
        </h1>
        <p className="text-[14px] text-zinc-500">
          Vyber sebe a zadej PIN.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-4">
        {PEOPLE.map((p, i) => (
          <li
            key={p.id}
            className={i === 4 ? "col-span-2 mx-auto w-1/2" : undefined}
          >
            <Link
              href="/preview/dnes"
              className="flex flex-col items-center gap-3 rounded-2xl border border-[#EFEFEF] bg-white px-4 py-6 transition hover:border-orange-200 hover:bg-orange-50/40"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.name[0]}
              </span>
              <span className="flex flex-col items-center gap-0.5 leading-tight">
                <span className="text-[16px] font-semibold">{p.name}</span>
                <span
                  className={`${funnel} text-[10px] tracking-[0.2em] text-zinc-500`}
                >
                  {p.role.toUpperCase()}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="pt-8 text-center text-[12px] text-zinc-400">
        Tohle je klikací ukázka. PIN se nezadává — kdokoliv kliknete, vstoupíte
        do dceřiného profilu Anička.
      </p>
    </main>
  );
}
