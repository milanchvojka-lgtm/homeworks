import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  Flame,
  Gift,
  Menu,
  ReceiptText,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { QuizPoll, WaitlistForm } from "./_forms";

// Product landing page (D26). Source: pen, návrh 3b · týmovost (UYupj). Light only, public.

export const metadata: Metadata = {
  title: "Homeworks · rodinná appka na domácí povinnosti a kapesné",
  description:
    "Doma konečně táhneme za jeden provaz. Děti převezmou svůj díl domácnosti, vydělají si a samy hlídají čas u obrazovky.",
};

const NAV = [
  ["#jak-to-funguje", "Jak to funguje"],
  ["#screen-time", "Screen time"],
  ["#rodice", "Pro rodiče"],
  ["#pravidla", "Pravidla"],
  ["#otazky", "Časté otázky"],
] as const;

const FAQ = [
  [
    "Kolik to stojí?",
    "Zatím nic. Platíte zpětnou vazbou: co funguje, co ne a co vám chybí. Pokud jednou zavedeme poplatek, bude to cena provozu appky a 50 % navíc. Při desítkách rodin jde o pár desítek korun měsíčně.",
  ],
  [
    "Na čem to běží?",
    "Na telefonu. Otevřete odkaz v prohlížeči a přidáte si ho na plochu, pak se chová jako appka. Nic se nestahuje z App Store.",
  ],
  [
    "Jak dlouho trvá nastavení?",
    "Asi 15–20 minut: děti, oblasti, povinnosti a pár placených úkolů. Dětem pak appku spustíte společně, první týden je na zkoušku a dostanou 100 Kč do začátku.",
  ],
  [
    "Co o dětech ukládáte?",
    "Jen jméno, které zadáte, a co v appce dělají: povinnosti, úkoly, kredit. Žádný e-mail ani telefon dítěte, žádná reklama.",
  ],
  [
    "Co když je dítě na táboře nebo nemocné?",
    "Zadáte nepřítomnost od–do, i zpětně v aktuálním týdnu. Dítě ty dny nic nemusí a řadu ani bonus neztratí.",
  ],
  [
    "Musí mít každé dítě svůj telefon?",
    "Nemusí. Každé má svůj profil a PIN, takže stačí i jeden sdílený telefon nebo tablet.",
  ],
] as const;

function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs font-bold tracking-[0.15em] text-muted-foreground lg:text-[13px]", className)}>
      {children}
    </p>
  );
}

function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[32px] leading-[1.08] font-bold tracking-[-0.025em] text-balance lg:text-[52px]", className)}>
      {children}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-[17px] leading-[1.55] text-muted-foreground lg:text-xl">{children}</p>;
}

function Section({
  id,
  className,
  inner,
  children,
}: {
  id?: string;
  className?: string;
  inner?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16", className)}>
      <div className={cn("mx-auto max-w-[1440px] px-5 py-16 sm:px-10 lg:px-[120px] lg:py-[120px]", inner)}>
        {children}
      </div>
    </section>
  );
}

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-tile bg-muted", className)}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 bg-highlight-soft/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-10 lg:px-[120px] lg:py-7">
        <a href="#" className="font-mono text-sm font-bold tracking-[0.2em]">
          HOMEWORKS
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-medium lg:flex">
          {NAV.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-muted-foreground">
              {label}
            </a>
          ))}
          <a href="#zajemci" className="font-bold underline underline-offset-4">
            Chci být mezi prvními →
          </a>
        </nav>
        <details className="group relative lg:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden">
            <Menu className="size-6" aria-label="Menu" />
          </summary>
          <nav className="absolute right-0 top-12 flex w-60 flex-col rounded-xl bg-card p-2 text-base font-medium shadow-lg ring-1 ring-border">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-3 hover:bg-muted">
                {label}
              </a>
            ))}
            <a href="#zajemci" className="rounded-lg px-3 py-3 font-bold underline underline-offset-4 hover:bg-muted">
              Chci být mezi prvními →
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="theme-light-only bg-background text-foreground">
      <Header />
      <main>
        {/* 1 · Úvod */}
        <section className="bg-highlight-soft">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-5 pt-8 sm:px-10 lg:flex-row lg:gap-16 lg:px-[120px] lg:pt-10">
            <div className="flex flex-1 flex-col gap-6 lg:gap-[26px] lg:pt-16 lg:pb-[120px]">
              <Kicker>HOMEWORKS · RODINNÁ APPKA NA DOMÁCÍ POVINNOSTI A KAPESNÉ</Kicker>
              <h1 className="text-[44px] leading-[1.02] font-bold tracking-[-0.03em] text-balance lg:text-[72px]">
                Doma konečně táhneme za jeden provaz.
              </h1>
              <p className="text-lg leading-[1.5] text-muted-foreground lg:text-[22px]">
                Vy pracujete, vaříte a nakupujete, děti převezmou svou oblast domácnosti. Homeworks jim dá
                přehled a motivaci, na které jim záleží. A vám ubude připomínání.
              </p>
              <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-5">
                <a href="#zajemci" className={cn(buttonVariants(), "h-14 px-[30px] text-lg")}>
                  Chci to vyzkoušet
                </a>
                <p className="text-base text-muted-foreground">
                  Pro rodiny s dětmi 10–15 let. Zatím zdarma, platíte zpětnou vazbou.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 self-center lg:self-end">
              <Image
                src="/landing/telefon-dnes.png"
                alt="Obrazovka Dnes v telefonu dítěte: kredit 380 Kč, řada 12 dní, povinnosti v kuchyni a dnešní úkoly"
                width={414}
                height={868}
                priority
                className="h-auto w-[300px] lg:w-[414px]"
              />
              <p className="pb-6 font-mono text-xs font-bold tracking-[0.08em] text-muted-foreground">
                Emi, 14: ví, co má dnes udělat
              </p>
            </div>
          </div>
        </section>

        {/* 2 · Zní vám to povědomě? */}
        <Section inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex flex-col gap-7 lg:w-[560px] lg:shrink-0">
            <Kicker>KAŽDÝ VEČER ZNOVU</Kicker>
            <H2>Zní vám to povědomě?</H2>
            <ul>
              {[
                "Vaříte, uklízíte, a ještě potřetí za večer připomínáte kuchyň.",
                "Každý den stejná debata o tom, kolik ještě může koukat.",
                "„To není fér, ona to minule nedělala.“",
                "Kapesné chodí, ať se doma něco udělá, nebo ne.",
                "Večer v posteli scrollují a netuší, kolik času tam nechali.",
              ].map((s) => (
                <li key={s} className="border-b border-border py-[18px] text-lg leading-[1.4] lg:text-xl">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[420px] w-full sm:h-[560px] lg:h-[620px] lg:flex-1">
            <Photo
              src="/landing/foto-linka.jpg"
              alt="Linka plná nádobí večer"
              className="absolute top-0 left-0 h-[78%] w-[78%]"
            />
            <Photo
              src="/landing/foto-tma.jpg"
              alt="Dítě v posteli ve tmě, jen světlo telefonu"
              className="absolute right-0 bottom-0 h-[58%] w-[57%] ring-8 ring-background"
            />
          </div>
        </Section>

        {/* 3 · Rodina je tým */}
        <Section className="bg-success-soft" inner="flex flex-col-reverse gap-12 lg:flex-row lg:items-center lg:gap-24">
          <Photo
            src="/landing/foto-spolu-uklizime.jpg"
            alt="Ruce dospělého a dítěte, jak spolu uklízejí stůl po večeři"
            className="aspect-[7/8] w-full lg:w-[560px] lg:shrink-0"
          />
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>RODINA JE TÝM</Kicker>
            <H2>Doma hrajeme za jeden tým.</H2>
            <Lead>
              Dokud byly děti malé, domácnost jste táhli sami. Dnes už to zvládnou a můžou se do týmu vrátit
              naplno. Vy dál pracujete, vaříte, nakupujete a vozíte je na kroužky. Ony převezmou svůj díl.
              Kapesné pak není samozřejmost, ale jejich podíl na společné práci.
            </Lead>
            <div className="flex max-w-[400px] flex-col gap-3 pt-3">
              <Image
                src="/landing/oblast-tydne.png"
                alt="Kompetence Kuchyň: Linka prázdná čeká na schválení, Kuchyň připravená na ráno schváleno"
                width={401}
                height={362}
                className="h-auto w-full"
              />
              <p className="font-mono text-sm tracking-[0.03em] text-muted-foreground">
                Na týden jedna oblast. Každé pondělí se samy prostřídají.
              </p>
            </div>
          </div>
        </Section>

        {/* 4 · Jak to funguje */}
        <Section id="jak-to-funguje" className="bg-card" inner="flex flex-col gap-10 lg:gap-14">
          <div className="flex max-w-[760px] flex-col gap-5">
            <Kicker>JAK TO FUNGUJE</Kicker>
            <H2>Čtyři kroky, které se každý týden opakují samy.</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:gap-8">
            {(
              [
                [
                  "Dítě nahlásí hotovo",
                  "Kuchyň je tento týden její díl. Přejede prstem, že je hotovo, a vy víte, že se na ni můžete spolehnout.",
                  "/landing/krok-1.png",
                  156,
                  "Povinnost Kuchyň připravená na ráno s posuvníkem Přejeď, až bude hotovo",
                ],
                [
                  "Vy schválíte jedním ťuknutím",
                  "Večer projdete, co děti nahlásily. Schválíte, nebo vrátíte s poznámkou.",
                  "/landing/krok-2.png",
                  140,
                  "Schválení povinnosti s tlačítky Vrátit a Schválit",
                ],
                [
                  "Placené úkoly navíc",
                  "Když má povinnosti hotové, bere si úkoly za peníze. Vidí odměnu i kolik to zabere.",
                  "/landing/krok-3.png",
                  147,
                  "Nabídka úkolu Umýt okna za 300 Kč, asi 120 minut",
                ],
                [
                  "Screen time, nebo peníze",
                  "Vydělané si vymění za čas u obrazovky, nebo mu to v neděli vyplatíte. Rozhoduje samo.",
                  "/landing/krok-4.png",
                  181,
                  "Tento týden: vyděláno 375 Kč, screen time −200 Kč, k výplatě v neděli 175 Kč",
                ],
              ] as const
            ).map(([title, text, src, h, alt], i) => (
              <div key={title} className="flex flex-col justify-between gap-6 rounded-xl bg-background p-6 lg:p-10">
                <div className="flex max-w-[440px] flex-col gap-3">
                  <p className="font-mono text-[44px] leading-none font-bold text-highlight">{i + 1}</p>
                  <h3 className="text-[22px] leading-[1.2] font-bold tracking-[-0.015em] lg:text-2xl">{title}</h3>
                  <p className="text-[17px] leading-[1.5] text-muted-foreground">{text}</p>
                </div>
                <Image src={src} alt={alt} width={381} height={h} className="h-auto w-full max-w-[380px]" />
              </div>
            ))}
          </div>
        </Section>

        {/* 5 · Screen time s hranicemi */}
        <Section
          id="screen-time"
          className="bg-info-soft"
          inner="flex flex-col gap-12 pb-0 lg:flex-row lg:items-end lg:gap-24 lg:pb-0"
        >
          <div className="flex flex-1 flex-col gap-7 lg:pb-[120px]">
            <Kicker>SCREEN TIME S HRANICEMI</Kicker>
            <H2>Ne všechno scrollování je špatně. Všechno ale má mít hranice.</H2>
            <Lead>
              Děti často vůbec netuší, kolik času u obrazovky stráví. V Homeworks vidí, kolik už odehrály, a čas
              si kupují z toho, co si vydělaly. Najednou má hodnotu.
            </Lead>
            <div className="flex flex-wrap items-end gap-x-5 gap-y-1 pt-4">
              <p className="font-mono text-[56px] leading-none font-bold tracking-[-0.03em] lg:text-[72px]">30 min</p>
              <p className="pb-1 text-xl font-semibold text-muted-foreground lg:text-[22px]">= 100 Kč z vydělaného</p>
            </div>
            <p className="font-mono text-base text-muted-foreground">Kredit nejde do mínusu. Cenu si nastavíte sami.</p>
          </div>
          <Image
            src="/landing/telefon-screen-time.png"
            alt="Obrazovka Screen time: můžeš si zahrát 1 h 30 min, volba 30, 60 nebo 90 minut"
            width={414}
            height={560}
            className="h-auto w-[300px] self-center lg:w-[414px]"
          />
        </Section>

        {/* 6 · Pro rodiče */}
        <Section id="rodice" inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>PRO RODIČE</Kicker>
            <H2>Méně připomínání. Víc času spolu.</H2>
            <div className="pt-2">
              {(
                [
                  ["VEČER", "Projdete, co děti nahlásily", "Jedním ťuknutím schválíte, nebo vrátíte s poznámkou."],
                  ["NEDĚLE", "Vyplatíte, co zbylo", "Appka spočítá vydělané, screen time i bonus za každé dítě."],
                  ["TÁBOR, NEMOC", "Zadáte jednou, od–do", "I zpětně v aktuálním týdnu. Řada ani bonus se neztratí."],
                ] as const
              ).map(([when, title, text]) => (
                <div key={when} className="flex flex-col gap-1 border-t border-border py-5 sm:flex-row sm:gap-6">
                  <p className="w-[130px] shrink-0 font-mono text-xs leading-[1.9] font-bold tracking-[0.1em] text-muted-foreground">
                    {when}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold">{title}</p>
                    <p className="text-[17px] leading-[1.5] text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Photo
              src="/landing/foto-cas-spolu.jpg"
              alt="Rodina večer u stolu hraje deskovou hru"
              className="aspect-[16/9] w-full lg:aspect-auto lg:h-[260px]"
            />
          </div>
          <Image
            src="/landing/telefony-rodic.png"
            alt="Telefony rodiče: Schválit – Nic nevisí, a Výplaty za týden pro Emi, Neli a Ani"
            width={714}
            height={940}
            className="h-auto w-full max-w-[520px] self-center lg:w-[714px] lg:max-w-none"
          />
        </Section>

        {/* 7 · Děti to mají za své */}
        <Section className="bg-warning-soft" inner="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>DĚTI TO MAJÍ ZA SVÉ</Kicker>
            <H2>Jejich díl je vidět. A vyplatí se.</H2>
            <ul className="flex flex-col gap-3.5">
              {(
                [
                  [Smartphone, "Vlastní telefon a vlastní PIN."],
                  [Flame, "Řada dní a trofeje za 7, 14 a 30 dní."],
                  [BadgeCheck, "Měsíční bonus, plný, když nic nevynechají."],
                  [ReceiptText, "Vidí, co si vydělaly a za co."],
                  [Gift, "První týden na zkoušku a 100 Kč do začátku."],
                ] as const
              ).map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-3.5 text-lg leading-[1.4]">
                  <Icon className="size-[22px] shrink-0 text-warning" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center lg:gap-12">
            <Image
              src="/landing/deti-ukazky.png"
              alt="Další trofej Steady za 2 dny, měsíční bonus bez zaváhání a seznam Za co s úkoly a screen time"
              width={381}
              height={549}
              className="h-auto w-full max-w-[380px]"
            />
            <Photo
              src="/landing/foto-odskrtava.jpg"
              alt="Ruce dítěte s telefonem v uklizené kuchyni"
              className="aspect-[300/620] w-[240px] lg:w-[300px]"
            />
          </div>
        </Section>

        {/* 8 · Pravidla jsou vaše */}
        <Section id="pravidla" className="bg-card" inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>PRAVIDLA JSOU VAŠE</Kicker>
            <H2>Každá rodina to má jinak. Homeworks se přizpůsobí.</H2>
            <Lead>Nastavíte si, co doma platí. A když se to neosvědčí, změníte to jedním uložením.</Lead>
            <ul className="grid gap-x-8 pt-2 sm:grid-cols-2">
              {[
                "Oblasti a povinnosti, i s termínem",
                "Cena screen time",
                "Placené úkoly a jejich odměny",
                "Měsíční bonus a jeho srážka",
                "Hodinová sazba",
                "Trofeje a vstupní bonus",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 border-b border-border py-3.5 text-[17px]">
                  <Check className="size-[18px] shrink-0 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Image
            src="/landing/nastaveni.png"
            alt="Nastavení: hodinová sazba 150 Kč, screen time 200 Kč za hodinu, měsíční bonus 200 Kč, krok ubývání 50 Kč, vstupní bonus 100 Kč"
            width={440}
            height={573}
            className="h-auto w-full max-w-[440px] self-center"
          />
        </Section>

        {/* 9 · Připravujeme: kvízy */}
        <Section className="bg-muted" inner="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex flex-1 flex-col items-start gap-7">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-info-soft px-2.5 font-mono text-[11px] font-bold tracking-[0.08em] text-info">
              <Sparkles className="size-3" /> PŘIPRAVUJEME
            </span>
            <H2>Screen time, který si vyslouží hlavou.</H2>
            <Lead>
              Krátké kvízy z mediální gramotnosti a z toho, jak rozumně používat sociální sítě. Za správné
              odpovědi si dítě vyslouží čas u obrazovky.
            </Lead>
          </div>
          <div className="flex w-full flex-col gap-6 rounded-xl bg-card p-6 lg:w-[440px] lg:p-10">
            <p className="text-2xl leading-[1.2] font-bold tracking-[-0.02em] lg:text-[28px]">
              Chtěli byste to pro své děti?
            </p>
            <QuizPoll />
            <p className="font-mono text-sm text-muted-foreground">Jedno ťuknutí. Nic dalšího nevyplňujete.</p>
          </div>
        </Section>

        {/* 10 · Příběh */}
        <Section className="bg-foreground text-card" inner="flex flex-col gap-12 lg:gap-16">
          <div className="flex max-w-[960px] flex-col gap-7">
            <Kicker className="text-subtle">PROČ HOMEWORKS VZNIKLO</Kicker>
            <blockquote className="text-[28px] leading-[1.2] font-semibold tracking-[-0.02em] lg:text-[44px]">
              „[ZÁSTUPNÝ TEXT: Milanův citát, 2–3 věty o tom, proč appku postavil pro vlastní rodinu.]“
            </blockquote>
            <p className="font-mono text-lg font-bold tracking-[0.05em] text-subtle">Milan, táta tří holek</p>
          </div>
          <div className="grid gap-8 border-t border-muted-foreground pt-10 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <p className="font-mono text-5xl font-bold tracking-[-0.03em] text-highlight lg:text-[64px]">[ČÍSLO]</p>
                <p className="text-lg text-subtle">[ZÁSTUPNÝ TEXT: co číslo znamená]</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 11 · Časté otázky */}
        <Section id="otazky" inner="flex flex-col gap-10 lg:flex-row lg:gap-24">
          <div className="flex flex-col gap-4 lg:w-[420px] lg:shrink-0">
            <Kicker>ČASTÉ OTÁZKY</Kicker>
            <H2>Než to zkusíte</H2>
          </div>
          <div className="flex-1">
            {FAQ.map(([q, a]) => (
              <div key={q} className="flex flex-col gap-2 border-t border-border py-6">
                <h3 className="text-xl font-bold">{q}</h3>
                <p className="text-[17px] leading-[1.55] text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 12 · Seznam zájemců */}
        <Section id="zajemci" className="bg-highlight-soft" inner="flex flex-col items-center gap-6 text-center">
          <H2 className="max-w-[820px]">Domácnost je týmový sport. Pojďte do něj všichni.</H2>
          <p className="text-[17px] text-muted-foreground lg:text-xl">
            Zatím testujeme s prvními rodinami. Nechte nám e-mail a ozveme se, až bude místo.
          </p>
          <div className="flex w-full justify-center pt-4">
            <WaitlistForm />
          </div>
        </Section>
      </main>
      <footer className="border-t border-border bg-highlight-soft">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[120px]">
          <p className="font-mono text-sm font-bold tracking-[0.15em]">HOMEWORKS</p>
          <p className="text-sm text-muted-foreground">Rodinná appka pro domácnost, kde táhnou všichni.</p>
        </div>
      </footer>
    </div>
  );
}
