import type { Metadata } from "next";
import Image from "next/image";
import { H2, Kicker, LandingHeader, Lead, Photo, Section } from "@/app/_components/landing-ui";
import { ShareToParents } from "./_share-button";

// Kids landing page (D27). Source: pen, HW · Landing page děti · návrh 1 (Ph5TJ). Light only, public, no forms.

export const metadata: Metadata = {
  title: "Homeworks · tvoje prachy, tvůj screen time",
  description:
    "Uděláš svůj díl doma, vezmeš si úkoly navíc a za vydělaný si koupíš čas u obrazovky. Kolik a kdy, řešíš ty.",
};

const NAV = [
  ["#kolik", "Kolik vyděláš"],
  ["#screen-time", "Screen time"],
  ["#trofeje", "Řada a trofeje"],
] as const;

// Default milestones from prisma/seed.ts (parents can change them).
const TROPHIES = [
  ["🥉", "7 dní", "trofej"],
  ["🥈", "14 dní", "trofej"],
  ["🥇", "30 dní", "+100 Kč"],
  ["💎", "60 dní", "+200 Kč"],
  ["👑", "100 dní", "+500 Kč"],
  ["⚡", "365 dní", "+2 000 Kč"],
] as const;

const STEPS = [
  [
    "Přejeď, až je hotovo",
    "Uklidíš svou oblast a jedním tahem to nahlásíš.",
    "/landing/deti/krok-1.png",
    156,
    "Povinnost Kuchyň připravená na ráno s posuvníkem Přejeď, až bude hotovo",
  ],
  [
    "Naši to schválí",
    "Mrknou a ťuknou. Nebo ti to vrátí s poznámkou, co dodělat.",
    "/landing/deti/krok-2.png",
    156,
    "Povinnost Linka prázdná, schváleno",
  ],
  [
    "Prachy máš na kontě",
    "Každá koruna je ve výpisu. Víš přesně, za co.",
    "/landing/deti/krok-3.png",
    121,
    "Výpis: Půdička +75 Kč, Screen time 60 min −200 Kč",
  ],
] as const;

export default function KidsLandingPage() {
  return (
    <div className="theme-light-only bg-background text-foreground">
      <LandingHeader nav={NAV} cta={["/pro-rodice", "Jsi rodič? →"]} dark />
      <main>
        {/* 1 · Úvod */}
        <section className="bg-foreground text-card">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-5 pt-8 sm:px-10 lg:flex-row lg:gap-16 lg:px-[120px] lg:pt-10">
            <div className="flex flex-1 flex-col gap-6 lg:gap-[26px] lg:pt-16 lg:pb-[120px]">
              <Kicker className="text-subtle">HOMEWORKS · APPKA PRO TEBE, NE NA TEBE</Kicker>
              <h1 className="text-[44px] leading-[1.02] font-bold tracking-[-0.03em] text-balance lg:text-[72px]">
                Tvoje prachy. Tvůj screen time. Žádný dohadování.
              </h1>
              <p className="text-lg leading-[1.5] text-subtle lg:text-[22px]">
                Uděláš svůj díl doma, vezmeš si úkoly navíc a za vydělaný si koupíš čas u obrazovky. Kolik a
                kdy, řešíš ty.
              </p>
              <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-5">
                <ShareToParents className="bg-card text-foreground hover:bg-card/90" />
                <p className="text-base text-subtle">Pošle jim odkaz. Zbytek nastaví oni.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 self-center lg:self-end">
              <Image
                src="/landing/deti/telefon-vydelat.png"
                alt="Obrazovka Vydělat: nabídka úkolů Umýt okna za 300 Kč a Půdička za 75 Kč"
                width={415}
                height={869}
                priority
                className="h-auto w-[300px] lg:w-[415px]"
              />
              <p className="pb-6 font-mono text-xs font-bold tracking-[0.08em] text-subtle">
                Emi, 14: vidí, kolik který úkol vynese
              </p>
            </div>
          </div>
        </section>

        {/* 2 · Kolik vyděláš */}
        <Section id="kolik" inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>KOLIK VYDĚLÁŠ</Kicker>
            <H2>Úkol má cenu dřív, než ho vezmeš.</H2>
            <Lead>
              Když máš hotový svůj díl, odemknou se úkoly navíc. Vidíš, kolik vynesou a jak dlouho zaberou.
              Bereš si, co chceš.
            </Lead>
            <div className="flex flex-col gap-1.5 pt-3">
              <p className="font-mono text-[64px] leading-none font-bold tracking-[-0.04em] text-highlight lg:text-[96px]">
                450 Kč
              </p>
              <p className="font-mono text-base text-muted-foreground lg:text-lg">
                za jedno umytí auta. Skutečně, z výpisu Emi.
              </p>
            </div>
          </div>
          <Photo
            src="/landing/deti/foto-auto.jpg"
            alt="Ruce v mikině myjí auto houbou s pěnou"
            className="aspect-[520/620] w-full lg:w-[520px] lg:shrink-0"
          />
        </Section>

        {/* 3 · Screen time */}
        <Section
          id="screen-time"
          className="bg-info-soft"
          inner="flex flex-col gap-12 pb-0 lg:flex-row lg:items-end lg:gap-24 lg:pb-0"
        >
          <div className="flex flex-1 flex-col gap-7 lg:pb-[120px]">
            <Kicker>SCREEN TIME</Kicker>
            <H2>Screen time si kupuješ. Nevyprošuješ.</H2>
            <Lead>
              Za vydělaný si vezmeš 30, 60 nebo 90 minut. Vidíš, kolik ti zbývá, a nikdo ti nemusí říkat, že už
              bylo dost.
            </Lead>
            <div className="flex flex-wrap items-end gap-x-5 gap-y-1 pt-4">
              <p className="font-mono text-[56px] leading-none font-bold tracking-[-0.03em] lg:text-[72px]">30 min</p>
              <p className="pb-1 text-xl font-semibold text-muted-foreground lg:text-[22px]">= 100 Kč</p>
            </div>
            <p className="font-mono text-base text-muted-foreground">Do mínusu to nejde. Žádnej dluh.</p>
          </div>
          <Image
            src="/landing/deti/telefon-screen-time.png"
            alt="Obrazovka Screen time: můžeš si zahrát 1 h 30 min, volba 30, 60 nebo 90 minut"
            width={414}
            height={560}
            className="h-auto w-[300px] self-center lg:w-[414px]"
          />
        </Section>

        {/* 4 · Fér pro všechny */}
        <Section className="bg-success-soft" inner="flex flex-col-reverse gap-12 lg:flex-row lg:items-center lg:gap-24">
          <Photo
            src="/landing/deti/foto-mycka.jpg"
            alt="Ruce dávají talíře do myčky"
            className="aspect-[520/560] w-full lg:w-[520px] lg:shrink-0"
          />
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>FÉR PRO VŠECHNY</Kicker>
            <H2>Každej má svůj díl. Nikdo se neveze.</H2>
            <Lead>
              Na týden máš jednu oblast, v pondělí se prostřídáte. Úkoly navíc mají frontu, takže je nezabere
              jen jedna. A „ona to minule nedělala“ už nikdo neřekne: je to vidět.
            </Lead>
          </div>
        </Section>

        {/* 5 · Řada a trofeje */}
        <Section id="trofeje" className="bg-warning-soft" inner="flex flex-col gap-10 lg:gap-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-24">
            <div className="flex flex-1 flex-col gap-7">
              <Kicker>ŘADA A TROFEJE</Kicker>
              <H2>Řada roste. Odměny taky.</H2>
              <Lead>
                Každej den, kdy máš svůj díl hotovej, přidá do řady. Za 7, 14 a 30 dní trofej, pak už i peníze.
                A když za měsíc nic nevynecháš, máš plný bonus.
              </Lead>
            </div>
            <Image
              src="/landing/deti/bonus.png"
              alt="Měsíční bonus září: zatím bez zaváhání, každý zmeškaný den ubere 50 Kč"
              width={381}
              height={133}
              className="h-auto w-full max-w-[380px]"
            />
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {TROPHIES.map(([emoji, days, reward]) => (
              <li key={days} className="flex h-[150px] flex-col justify-between rounded-xl bg-card px-5 py-6 lg:h-[170px]">
                <span className="text-4xl leading-none">{emoji}</span>
                <span className="flex flex-col gap-1">
                  <span className="font-mono text-2xl font-bold tracking-[-0.02em] lg:text-[26px]">{days}</span>
                  <span
                    className={
                      reward.startsWith("+")
                        ? "font-mono text-[15px] font-bold"
                        : "font-mono text-[15px] font-bold text-muted-foreground"
                    }
                  >
                    {reward}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-sm text-muted-foreground">Trofeje a odměny si nastavují vaši. Tohle jsou výchozí.</p>
        </Section>

        {/* 6 · Jak to funguje */}
        <Section className="bg-card" inner="flex flex-col gap-10 lg:gap-14">
          <div className="flex flex-col gap-5">
            <Kicker>JAK TO FUNGUJE</Kicker>
            <H2>Tři kroky. Hotovo.</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-3 lg:gap-8">
            {STEPS.map(([title, text, src, h, alt], i) => (
              <div key={title} className="flex flex-col justify-between gap-6 rounded-xl bg-background p-6 lg:p-8">
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[44px] leading-none font-bold text-highlight">{i + 1}</p>
                  <h3 className="text-[22px] leading-[1.2] font-bold tracking-[-0.015em] lg:text-2xl">{title}</h3>
                  <p className="text-[17px] leading-[1.5] text-muted-foreground">{text}</p>
                </div>
                <Image src={src} alt={alt} width={316} height={h} className="h-auto w-full" />
              </div>
            ))}
          </div>
        </Section>

        {/* 7 · Start */}
        <Section className="bg-highlight-soft" inner="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>START</Kicker>
            <H2>Začínáš se stovkou.</H2>
            <Lead>
              První týden je na zkoušku: když něco nevyjde, řada ani bonus se nepokazí. Na kontě máš 100 Kč hned
              od začátku. A vlastní PIN, takže do tvýho profilu nikdo nevleze.
            </Lead>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <p className="font-mono text-[72px] leading-none font-bold tracking-[-0.04em] lg:text-[120px]">+100 Kč</p>
            <p className="font-mono text-base text-muted-foreground">vstupní bonus · týden na zkoušku</p>
          </div>
        </Section>

        {/* 8 · Závěr */}
        <Section inner="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-[900px] text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance lg:text-[64px]">
            Chceš to taky? Pošli to našim.
          </h2>
          <p className="text-[17px] text-muted-foreground lg:text-xl">
            Pošleš jim odkaz, přečtou si, co to je, a nastaví to. Tobě to zabere dvě vteřiny.
          </p>
          <div className="flex flex-col items-center gap-4 pt-4">
            <ShareToParents />
            <a href="/pro-rodice" className="text-base font-semibold underline underline-offset-4">
              Jsi rodič? Všechno pro tebe je tady →
            </a>
          </div>
        </Section>
      </main>
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[120px]">
          <p className="font-mono text-sm font-bold tracking-[0.15em]">HOMEWORKS</p>
          <p className="text-sm text-muted-foreground">Appka pro tebe, ne na tebe.</p>
        </div>
      </footer>
    </div>
  );
}
