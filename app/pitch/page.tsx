import Link from "next/link";
import {
  Sparkles,
  RotateCw,
  ListChecks,
  Wallet,
  Monitor,
  Check,
  Star,
  ArrowUpRight,
} from "lucide-react";

const ACCENT = "#FF5C00";
const ACCENT_2 = "#FF8533";
const ACCENT_TINT = "#FFEEDD";
const ACCENT_STROKE = "#FFD9C2";
const INK = "#1A1A1A";
const INK_2 = "#666666";
const SOFT_BG = "#F7F8FA";
const LINE = "#F3F4F6";
const MUTED = "#888888";

const newsreader = "font-[family-name:var(--font-newsreader)]";
const funnel = "font-[family-name:var(--font-funnel)]";

export default function PitchPage() {
  return (
    <main>
      {/* TOP STRIP */}
      <div
        className={`flex items-center justify-center gap-[10px] px-4 py-[10px] text-white ${funnel}`}
        style={{ backgroundColor: ACCENT }}
      >
        <Sparkles size={14} strokeWidth={2} />
        <span className="text-[12px] font-medium tracking-[0.08em]">
          4-týdenní zkouška &nbsp;·&nbsp; rodinný experiment
        </span>
        <Sparkles size={14} strokeWidth={2} />
      </div>

      {/* HERO */}
      <section className="flex flex-col gap-6 px-7 pt-10 pb-8">
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-[6px] ${funnel}`}
          style={{ borderColor: ACCENT_STROKE }}
        >
          <span
            className="h-[6px] w-[6px] rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <span className="text-[11px] font-semibold tracking-[0.27em]">
            HOMEWORKS
          </span>
        </span>

        <h1
          className={`${newsreader} text-[34px] font-semibold leading-[1.15]`}
          style={{ color: INK }}
        >
          Péče o domácnost.
          <br />
          Nový systém na 4 týdny.
        </h1>

        <p className="text-[15px] leading-[1.5]" style={{ color: INK_2 }}>
          Pitch od Milana — pro Teri.
        </p>

        <HeroDeco />
      </section>

      {/* SECTION 2 — Co řeším */}
      <section className="flex flex-col gap-[18px] px-7 pt-2 pb-8">
        <p className="text-[16px] leading-[1.6]">
          Náš současný systém na domácí povinnosti nefunguje a oba to víme.
          Domlouváme se pořád dokola, holky netuší, co se po nich kdy chce a co
          za to dostanou, a my netušíme, jestli a kdy něco vážně udělaly.
        </p>
        <p className="text-[16px] leading-[1.6]">
          Občas to dopadne hádkou. Často to končí tím, že to nakonec uděláme
          sami a holky o tom ani nevědí.
        </p>
        <p className="text-[16px] leading-[1.6]">
          Napadlo mě zkusit to jinak. Aby všichni věděli, kdo má co na starosti,
          co za to dostane, a kdy.
        </p>
      </section>

      {/* SECTION 3 — Co navrhuju */}
      <section className="flex flex-col gap-7 px-7 pt-6 pb-10">
        <NumberedHeader number="01" />
        <h2
          className={`${newsreader} text-[30px] font-semibold`}
          style={{ color: INK }}
        >
          Co navrhuju
        </h2>

        <Block3
          icon={<RotateCw size={16} strokeWidth={2.25} color={ACCENT} />}
          title="Rotace kompetencí"
          body="Tři oblasti — kuchyň, obývák, koupelna. Každý týden je má jedna z holek na starost. Každá projde každou jednou za 3 týdny."
        />
        <Block3
          icon={<ListChecks size={16} strokeWidth={2.25} color={ACCENT} />}
          title="Extra úkoly za peníze"
          body="Větší věci (vyklidit půdu, umýt auto, posekat zahradu) si můžou holky vzít z poolu. Každý úkol má cenu v korunách. Ten, kdo to nezabere první, ho nedostane."
        />
        <Block3
          icon={<Wallet size={16} strokeWidth={2.25} color={ACCENT} />}
          title="Kredit místo dohadování"
          body="Co holky udělají, vidí jako kredit na svém kontě v aplikaci. V neděli se to uzavře — část v hotovosti, část si můžou nechat na screentime."
        />
        <Block3
          icon={<Monitor size={16} strokeWidth={2.25} color={ACCENT} />}
          title="Obrazovka jako měna"
          body="Holky si můžou výdělek vyměnit za čas u obrazovky. 100 Kč = 30 minut. Aplikace nic nevynucuje (od toho je Apple Screen Time), jen eviduje. Volba je jejich: peníze, nebo Instáč."
        />
      </section>

      {/* PREVIEW — Jak by to vypadalo */}
      <section className="flex flex-col gap-6 px-7 pt-2 pb-10">
        <div className="flex items-center gap-[10px]">
          <Sparkles size={14} strokeWidth={2.25} color={ACCENT} />
          <span
            className={`${funnel} text-[11px] font-semibold tracking-[0.27em]`}
            style={{ color: ACCENT }}
          >
            JAK BY TO VYPADALO
          </span>
          <span className="h-px flex-1" style={{ backgroundColor: LINE }} />
        </div>
        <h2
          className={`${newsreader} text-[26px] font-semibold leading-tight`}
        >
          Pár obrazovek na ukázku.
        </h2>
        <p className="text-[14px] leading-[1.6]" style={{ color: INK_2 }}>
          Tohle je klikací prototyp — můžeš si projít, jak by to vypadalo na
          telefonu. Žádná data se neukládají.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <PreviewCard
            href="/preview"
            label="Login"
            note="5 dlaždic — každá jiná obrazovka"
            preview={<LoginPreview />}
          />
          <PreviewCard
            href="/preview/ani"
            label="Ani · Dnes"
            note="Kuchyň, středa, bonus ve hře"
            preview={<DnesPreview />}
          />
          <PreviewCard
            href="/preview/emi"
            label="Emi · Pool"
            note="Splnila checky → odemčen pool"
            preview={<PoolPreview />}
          />
          <PreviewCard
            href="/preview/neli"
            label="Neli · Kredit"
            note="Bonus padl, nízký zůstatek"
            preview={<KreditPreview />}
          />
          <PreviewCard
            href="/preview/admin/inbox"
            label="Milan · Inbox"
            note="7 čekajících ke schválení"
            preview={<InboxPreview />}
          />
          <PreviewCard
            href="/preview/admin/payouts"
            label="Teri · Výplata"
            note="Neděle, weekly close"
            preview={<PayoutsPreview />}
          />
        </div>
        <Link
          href="/preview"
          className={`${funnel} mt-2 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold tracking-[0.18em]`}
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          OTEVŘÍT UKÁZKU
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
      </section>

      {/* SECTION 4 — Co bys dělala ty (soft background) */}
      <section
        className="flex flex-col gap-[18px] p-7"
        style={{ backgroundColor: SOFT_BG }}
      >
        <NumberedHeader number="02" />
        <h2
          className={`${newsreader} text-[28px] font-semibold`}
          style={{ color: INK }}
        >
          Co bys dělala ty
        </h2>
        <ul className="flex flex-col gap-[14px]">
          <CheckRow text="Společný admin účet — schvaluješ úkoly stejně jako já, nemáme oddělená oprávnění." />
          <CheckRow text="Pár kliknutí denně, nejvíc 5 minut. Jedna z holek klikne hotovo, ty (nebo já) klikneme schváleno nebo vrátit." />
          <CheckRow text="Můžeš kdykoliv změnit pravidla, ceny úkolů, sazbu obrazovky. Nic není zabetonované." />
          <CheckRow text="Cokoliv, co bys ráda viděla jinak, řekni — udělám to." />
        </ul>
      </section>

      {/* SECTION 5 — Co když to nezabere */}
      <section className="flex flex-col gap-[18px] px-7 py-10">
        <NumberedHeader number="03" />
        <h2
          className={`${newsreader} text-[28px] font-semibold`}
          style={{ color: INK }}
        >
          Co když to nezabere
        </h2>
        <p className="text-[16px] leading-[1.6]">
          Nečekám zázrak. Možná se atmosféra zlepší o 20 %, možná o 50 %, možná
          to vůbec nezabere a holky to po týdnu začnou ignorovat.
        </p>
        <p className="text-[16px] leading-[1.6]">
          Proto navrhuju 4 týdny zkušebně. Pokud po 4 týdnech vidíme, že to
          atmosféru zhoršuje, ne zlepšuje, vypneme to a vrátíme se k tomu, co
          máme dnes. Žádný lock-in, žádné ale dali jsme do toho tolik práce.
        </p>
        <div
          className="flex flex-col gap-2 rounded-lg border p-[18px]"
          style={{ borderColor: ACCENT_STROKE }}
        >
          <span
            className={`${funnel} text-[11px] font-semibold tracking-[0.27em]`}
            style={{ color: ACCENT }}
          >
            Investice
          </span>
          <p className="text-[14px] leading-[1.6]">
            Z mojí strany: 2–3 týdny stavby aplikace navíc po práci. Z tvojí
            strany: 30 minut dnes, 5 minut denně po dobu zkoušky, a upřímná
            zpětná vazba na konci.
          </p>
        </div>
      </section>

      {/* SECTION 6 — Co od tebe potřebuju */}
      <section className="flex flex-col gap-6 px-7 pt-3 pb-8">
        <NumberedHeader number="04" />
        <h2
          className={`${newsreader} text-[28px] font-semibold`}
          style={{ color: INK }}
        >
          Co od tebe potřebuju
        </h2>
        <ol className="flex flex-col gap-4">
          <NumberedStep
            n={1}
            text="Říct, jestli to chceš zkusit, nebo ne."
          />
          <NumberedStep
            n={2}
            text="Pokud ano — 30 minut spolu, ať napíšeme konkrétní denní úkoly pro kuchyň, obývák a koupelnu."
          />
          <NumberedStep
            n={3}
            text="Po 4 týdnech mi upřímně říct, jak to bylo."
          />
        </ol>
      </section>

      {/* CTA — dark */}
      <section
        className="flex flex-col gap-[14px] px-7 pt-9 pb-10"
        style={{ backgroundColor: INK }}
      >
        <span
          className={`${funnel} inline-flex w-fit items-center gap-2 rounded-full px-3 py-[6px] text-white`}
          style={{ backgroundColor: ACCENT }}
        >
          <Sparkles size={12} strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-[0.18em]">
            FINÁLNÍ ZPRÁVA
          </span>
        </span>
        <p
          className={`${newsreader} text-[24px] font-semibold leading-[1.25] text-white`}
        >
          Řekni mi do víkendu, jestli to chceš zkusit, nebo radši ne.
        </p>
        <p
          className={`${newsreader} text-[24px] font-semibold italic`}
          style={{ color: ACCENT_2 }}
        >
          Obojí je v pohodě.
        </p>
        <CtaDeco />
      </section>

      {/* FOOTER */}
      <footer
        className={`${funnel} flex justify-center px-7 pt-[14px] pb-[18px]`}
      >
        <span
          className="text-[10px] font-medium tracking-[0.2em]"
          style={{ color: MUTED }}
        >
          Homeworks &nbsp;·&nbsp; domácí pitch &nbsp;·&nbsp; v2
        </span>
      </footer>
    </main>
  );
}

function NumberedHeader({ number }: { number: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <span
        className={`${funnel} text-[11px] font-semibold tracking-[0.27em]`}
        style={{ color: ACCENT }}
      >
        {number}
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: LINE }} />
    </div>
  );
}

function Block3({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: ACCENT_TINT }}
        >
          {icon}
        </span>
        <h3
          className={`${newsreader} text-[20px] font-semibold`}
          style={{ color: INK }}
        >
          {title}
        </h3>
      </div>
      <p className="text-[14px] leading-[1.6]" style={{ color: INK_2 }}>
        {body}
      </p>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="pt-[3px]">
        <Check size={16} strokeWidth={2.5} color={ACCENT} />
      </span>
      <span className="text-[14px] leading-[1.55]">{text}</span>
    </li>
  );
}

function NumberedStep({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex items-start gap-[14px]">
      <span
        className={`${funnel} flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white`}
        style={{ backgroundColor: ACCENT }}
      >
        {n}
      </span>
      <span className="pt-[3px] text-[15px] leading-[1.55]">{text}</span>
    </li>
  );
}

function HeroDeco() {
  return (
    <div className="flex items-center gap-[14px] pt-1">
      <Sparkles size={14} strokeWidth={2} color={ACCENT} />
      <span
        className="h-[6px] w-[6px] rounded-full"
        style={{ backgroundColor: ACCENT_2 }}
      />
      <Star size={10} strokeWidth={2} fill={ACCENT_2} color={ACCENT_2} />
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: ACCENT }}
      />
    </div>
  );
}

function CtaDeco() {
  return (
    <div className="flex items-center gap-[10px] pt-2">
      <Sparkles size={12} strokeWidth={2} color={ACCENT} />
      <span
        className="h-[5px] w-[5px] rounded-full"
        style={{ backgroundColor: ACCENT_2 }}
      />
      <Star size={8} strokeWidth={2} fill={ACCENT_2} color={ACCENT_2} />
    </div>
  );
}

/* ───────── Preview cards ───────── */

function PreviewCard({
  href,
  label,
  note,
  preview,
}: {
  href: string;
  label: string;
  note: string;
  preview: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#EFEFEF] bg-white transition hover:border-orange-200 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-50">
        <div className="absolute inset-2 flex flex-col rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
            <span className="text-[7px] font-semibold tracking-wider text-zinc-400">
              9:41
            </span>
            <span className="flex items-center gap-0.5 text-zinc-300">
              <span className="h-1 w-2.5 rounded-sm bg-zinc-300" />
            </span>
          </div>
          {preview}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex flex-col">
          <span
            className={`${newsreader} text-[15px] font-semibold leading-tight`}
            style={{ color: INK }}
          >
            {label}
          </span>
          <span className="text-[11px]" style={{ color: INK_2 }}>
            {note}
          </span>
        </div>
        <ArrowUpRight
          size={14}
          strokeWidth={2.25}
          className="text-zinc-300 transition group-hover:text-orange-500"
        />
      </div>
    </Link>
  );
}

function LoginPreview() {
  const colors = ["#3B82F6", "#A855F7", "#EC4899", "#10B981", "#F59E0B"];
  return (
    <div className="flex flex-1 flex-col items-center px-2 pt-2 pb-2">
      <span
        className={`${funnel} text-[5px] font-bold tracking-[0.3em]`}
        style={{ color: ACCENT }}
      >
        HOMEWORKS
      </span>
      <span className="mt-0.5 text-[6px] font-semibold">Klikni na profil</span>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        {colors.slice(0, 4).map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5 rounded border border-zinc-100 px-1 py-1"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: c }}
            />
            <span className="h-[2px] w-3 rounded-full bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DnesPreview() {
  return (
    <div className="flex flex-1 flex-col px-2 pt-1 pb-1">
      <div className="mb-1 flex items-center gap-1 rounded bg-orange-100 px-1.5 py-1">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
        <span className="flex flex-col gap-0.5 leading-none">
          <span className="text-[4px] tracking-wider text-orange-600">
            TENTO TÝDEN
          </span>
          <span className="text-[6px] font-semibold">Kuchyň</span>
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <CheckLine done />
        <CheckLine wait />
        <CheckLine />
        <CheckLine />
      </div>
      <div className="mt-auto flex justify-around border-t border-zinc-100 pt-1">
        <span
          className="h-1 w-3 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
        <span className="h-1 w-2 rounded-full bg-zinc-200" />
        <span className="h-1 w-2 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

function CheckLine({ done, wait }: { done?: boolean; wait?: boolean }) {
  const dotBg = done ? "#10B981" : wait ? "#F59E0B" : "#E5E5E5";
  return (
    <div className="flex items-center gap-1 rounded border border-zinc-100 px-1 py-0.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dotBg }}
      />
      <span className="h-[2px] flex-1 rounded-full bg-zinc-200" />
      {!done && !wait && (
        <span
          className="h-1 w-2 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
      )}
    </div>
  );
}

function PoolPreview() {
  return (
    <div className="flex flex-1 flex-col gap-1 px-2 pt-1 pb-1">
      <span className="text-[5px] font-bold tracking-wider text-orange-600">
        MŮŽU VZÍT TEĎ
      </span>
      <div className="rounded border-2 border-orange-200 bg-orange-50/50 p-1">
        <div className="flex items-center justify-between gap-1">
          <span className="h-[3px] flex-1 rounded-full bg-zinc-300" />
          <span
            className="text-[6px] font-bold"
            style={{ color: ACCENT }}
          >
            250 Kč
          </span>
        </div>
        <div className="mt-1 flex justify-end">
          <span
            className="h-1.5 w-4 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
        </div>
      </div>
      <span className="mt-1 text-[5px] font-bold tracking-wider text-zinc-400">
        ZAMČENO
      </span>
      <div className="rounded border border-zinc-100 bg-zinc-50 p-1 opacity-70">
        <div className="flex items-center justify-between gap-1">
          <span className="h-[3px] flex-1 rounded-full bg-zinc-200" />
          <span className="text-[6px] font-bold text-zinc-400">150 Kč</span>
        </div>
      </div>
      <div className="rounded border border-zinc-100 bg-zinc-50 p-1 opacity-70">
        <div className="flex items-center justify-between gap-1">
          <span className="h-[3px] flex-1 rounded-full bg-zinc-200" />
          <span className="text-[6px] font-bold text-zinc-400">200 Kč</span>
        </div>
      </div>
    </div>
  );
}

function KreditPreview() {
  return (
    <div className="flex flex-1 flex-col px-2 pt-1 pb-1">
      <div className="mb-1 rounded bg-zinc-900 px-1.5 py-1.5">
        <span className="text-[4px] tracking-wider text-white/60">
          K VÝPLATĚ
        </span>
        <div
          className={`${newsreader} mt-0.5 text-[16px] font-bold leading-none`}
          style={{ color: ACCENT }}
        >
          50
          <span className="ml-0.5 text-[7px] text-white">Kč</span>
        </div>
      </div>
      <div className="mb-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-1">
        <span className="text-[5px] font-semibold text-rose-700">
          Bonus už ne 😞
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="h-[2px] w-3/4 rounded-full bg-zinc-200" />
        <span className="h-[2px] w-2/3 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

function InboxPreview() {
  return (
    <div className="flex flex-1 flex-col px-2 pt-1 pb-1">
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`${newsreader} text-[10px] font-bold leading-none`}
        >
          Inbox
        </span>
        <span
          className="rounded px-1 text-[5px] font-bold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          7
        </span>
      </div>
      <span className="mb-1 text-[5px] font-bold tracking-wider text-zinc-400">
        ANI · 3
      </span>
      <div className="mb-1 flex flex-col gap-0.5">
        <InboxLine kind="check" />
        <InboxLine kind="task" />
      </div>
      <span className="mb-1 text-[5px] font-bold tracking-wider text-zinc-400">
        EMI · 2
      </span>
      <div className="flex flex-col gap-0.5">
        <InboxLine kind="task" />
      </div>
    </div>
  );
}

function InboxLine({ kind }: { kind: "check" | "task" }) {
  const dot = kind === "task" ? ACCENT : "#3B82F6";
  return (
    <div className="flex items-center gap-1 rounded border border-zinc-100 bg-white px-1 py-0.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dot }}
      />
      <span className="h-[2px] flex-1 rounded-full bg-zinc-200" />
      <span className="rounded bg-zinc-900 px-1 text-[4px] font-bold text-white">
        OK
      </span>
    </div>
  );
}

function PayoutsPreview() {
  return (
    <div className="flex flex-1 flex-col gap-1 px-2 pt-1 pb-1">
      <span className={`${newsreader} text-[9px] font-bold leading-none`}>
        Týdenní výplata
      </span>
      <span className="text-[5px] tracking-wider text-zinc-400">
        21.–27. 4.
      </span>
      <PayoutLine name="ANI" amount="480" highlight />
      <PayoutLine name="EMI" amount="150" />
      <PayoutLine name="NELI" amount="50" />
    </div>
  );
}

function PayoutLine({
  name,
  amount,
  highlight,
}: {
  name: string;
  amount: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded px-1 py-0.5 ${
        highlight ? "bg-orange-50" : ""
      }`}
    >
      <span className="text-[6px] font-bold tracking-wider text-zinc-600">
        {name}
      </span>
      <span
        className="text-[8px] font-bold"
        style={{ color: highlight ? ACCENT : "#1A1A1A" }}
      >
        {amount}&nbsp;Kč
      </span>
    </div>
  );
}
