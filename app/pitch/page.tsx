import {
  Sparkles,
  RotateCw,
  ListChecks,
  Wallet,
  Monitor,
  Check,
  Star,
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
