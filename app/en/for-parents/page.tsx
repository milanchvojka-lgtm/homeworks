import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  Flame,
  Gift,
  ReceiptText,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { H2, Kicker, LandingHeader, Lead, Photo, Section } from "@/app/_components/landing-ui";
import { QuizPoll, WaitlistForm } from "@/app/_components/landing-forms";

// English parents landing page (D29). Source: pen, návrh 3b EN. Written for English speakers, not translated word for word.

export const metadata: Metadata = {
  title: "Homeworks · the family app for chores and pocket money",
  description:
    "Finally, a home everyone takes care of. Kids included. They take on their share of the house, earn their own money and keep an eye on their own screen time.",
};

const NAV = [
  ["#how-it-works", "How it works"],
  ["#screen-time", "Screen time"],
  ["#parents", "For parents"],
  ["#rules", "Your rules"],
  ["#faq", "FAQ"],
  ["/pro-rodice", "Česky"],
] as const;

const FAQ = [
  [
    "How much does it cost?",
    "Nothing, for now. You pay with feedback: what works, what doesn’t, and what’s missing. If we ever introduce a fee, it will cover the cost of running the app plus 50%. With a few dozen families, that comes to a small amount each month.",
  ],
  [
    "What does it run on?",
    "Your phone. Open the link in your browser and add it to your home screen, and it works just like an app. Nothing to download from the App Store.",
  ],
  [
    "How long does setup take?",
    "About 15–20 minutes: your kids, their areas, chores and a few paid jobs. Then you launch the app together with your kids. The first week is a trial run, and they get a starter bonus.",
  ],
  [
    "What do you store about my kids?",
    "Only the name you enter and what they do in the app: chores, jobs, balance. No email or phone number for your kids, and no ads.",
  ],
  [
    "What if my kid is at camp or sick?",
    "Mark them as away from–to, even after the fact within the current week. They don’t have to do anything on those days, and they keep their streak and bonus.",
  ],
  [
    "Does every kid need their own phone?",
    "No. Each kid has their own profile and PIN, so one shared phone or tablet works fine.",
  ],
  [
    "Is the app available in English?",
    "Not yet. The app is currently in Czech, and the screens on this page are translated previews. Join the list: knowing there’s interest helps us decide when to build the English version.",
  ],
] as const;

export default function EnglishLandingPage() {
  return (
    <div lang="en" className="theme-light-only bg-background text-foreground">
      <LandingHeader nav={NAV} cta={["#waitlist", "Join the waitlist →"]} />
      <main>
        {/* 1 · Úvod */}
        <section className="bg-highlight-soft">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-5 pt-8 sm:px-10 lg:flex-row lg:gap-16 lg:px-[120px] lg:pt-10">
            <div className="flex flex-1 flex-col gap-6 lg:gap-[26px] lg:pt-16 lg:pb-[120px]">
              <h1 className="text-[44px] leading-[1.02] font-bold tracking-[-0.03em] text-balance lg:text-[72px]">
                Finally, a home everyone takes care of. Kids included.
              </h1>
              <p className="text-lg leading-[1.5] text-muted-foreground lg:text-[22px]">
                You work, cook and shop. Your kids take charge of their own part of the house. Homeworks gives
                them the overview and the motivation they actually care about, so you can stop reminding them
                what’s still not done.
              </p>
              <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-5">
                <a href="#waitlist" className={cn(buttonVariants(), "h-14 px-[30px] text-lg")}>
                  I want to try it
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 self-center lg:self-end">
              <Image
                src="/landing/en/phone-today.png"
                alt="The Today screen on a kid’s phone: balance 380 CZK, a 12-day streak, kitchen chores and today’s jobs"
                width={414}
                height={868}
                priority
                className="h-auto w-[300px] lg:w-[414px]"
              />
            </div>
          </div>
        </section>

        {/* 2 · Sound familiar? */}
        <Section inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex flex-col gap-7 lg:w-[560px] lg:shrink-0">
            <H2>Sound familiar?</H2>
            <ul>
              {[
                "You cook, you clean, and you’re still asking about the kitchen for the third time tonight.",
                "Every day, the same negotiation over more time on the phone.",
                "“That’s not fair, she didn’t do it last time. Why me?!”",
                "Pocket money keeps coming, whether the house runs or not.",
                "They scroll all day with no idea where the time went.",
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
              alt="A kitchen counter piled with dishes in the evening"
              className="absolute top-0 left-0 h-[78%] w-[78%]"
            />
            <Photo
              src="/landing/foto-tma.jpg"
              alt="A kid in bed in the dark, lit only by a phone"
              className="absolute right-0 bottom-0 h-[58%] w-[57%] ring-8 ring-background"
            />
          </div>
        </Section>

        {/* 3 · One team */}
        <Section className="bg-success-soft" inner="flex flex-col-reverse gap-12 lg:flex-row lg:items-center lg:gap-24">
          <Photo
            src="/landing/foto-spolu-uklizime.jpg"
            alt="An adult and a kid clearing the table together after dinner"
            className="aspect-[7/8] w-full lg:w-[560px] lg:shrink-0"
          />
          <div className="flex flex-1 flex-col gap-7">
            <H2>We play on the same team.</H2>
            <Lead>
              When the kids were little, running the house was all on you. Now they can look after themselves,
              and it’s time they became part of the whole. They get food, a home, pocket money and the space to
              study. In return, they take on their share of the house.
            </Lead>
            <div className="flex max-w-[400px] flex-col gap-3 pt-3">
              <Image
                src="/landing/en/area-of-the-week.png"
                alt="Area: Kitchen. Counter cleared, waiting for approval; kitchen ready for the morning, approved"
                width={401}
                height={362}
                className="h-auto w-full"
              />
              <p className="font-mono text-sm tracking-[0.03em] text-muted-foreground">
                One area per week. Every Monday, they rotate automatically.
              </p>
            </div>
          </div>
        </Section>

        {/* 4 · How it works */}
        <Section id="how-it-works" className="bg-card" inner="flex flex-col gap-10 lg:gap-14">
          <div className="flex max-w-[760px] flex-col gap-5">
            <H2>Four steps. Every week. Homeworks keeps them running.</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:gap-8">
            {(
              [
                [
                  "Your kid marks it done",
                  "This week, the kitchen belongs to one of your kids. When it’s done, they swipe, and you know right away.",
                  "/landing/en/step-1.png",
                  156,
                  "Chore: kitchen ready for the morning, with a Swipe when it’s done slider",
                ],
                [
                  "You approve with one tap",
                  "In the evening, you check what they’ve reported. Approve it, or send it back with a note.",
                  "/landing/en/step-2.png",
                  140,
                  "Approving a chore, with Send back and Approve buttons",
                ],
                [
                  "Paid jobs come after chores",
                  "Once their chores are done, they can take on a paid job. They see the reward and how long it’ll take.",
                  "/landing/en/step-3.png",
                  147,
                  "Job offer: wash the windows for 300 CZK, about 120 minutes",
                ],
                [
                  "Cash or screen time",
                  "Kids trade what they’ve earned for screen time, or you pay it out on Sunday. It’s their call.",
                  "/landing/en/step-4.png",
                  181,
                  "This week: earned 375 CZK, screen time −200 CZK, Sunday payout 175 CZK",
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

        {/* 5 · Screen time, with limits */}
        <Section
          id="screen-time"
          className="bg-info-soft"
          inner="flex flex-col gap-12 pb-0 lg:flex-row lg:items-end lg:gap-24 lg:pb-0"
        >
          <div className="flex flex-1 flex-col gap-7 lg:pb-[120px]">
            <Kicker>SCREEN TIME, WITH LIMITS</Kicker>
            <H2>Not all scrolling is bad. But it needs limits.</H2>
            <Lead>
              Kids often have no idea how much time they spend on screens. With Homeworks, they see how much
              they’ve already used, and they pay for more with what they’ve earned. Suddenly screen time has a
              price they can weigh against everything else.
            </Lead>
            <div className="flex flex-wrap items-end gap-x-5 gap-y-1 pt-4">
              <p className="font-mono text-[56px] leading-none font-bold tracking-[-0.03em] lg:text-[72px]">30 min</p>
              <p className="pb-1 text-xl font-semibold text-muted-foreground lg:text-[22px]">= paid from their earnings</p>
            </div>
            <p className="font-mono text-base text-muted-foreground">Their balance can’t go below zero. You set the price.</p>
          </div>
          <Image
            src="/landing/en/phone-screen-time.png"
            alt="The Screen time screen: you can play for 1 h 30 min, choose 30, 60 or 90 minutes"
            width={414}
            height={560}
            className="h-auto w-[300px] self-center lg:w-[414px]"
          />
        </Section>

        {/* 6 · For parents */}
        <Section id="parents" inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>FOR PARENTS</Kicker>
            <H2>Less nagging. More time together.</H2>
            <div className="pt-2">
              {(
                [
                  ["EVENINGS", "Review what they’ve reported", "Approve with one tap, or send it back with a note."],
                  ["SUNDAYS", "Pay out what’s left", "The app tallies earnings, screen time and bonuses for each kid."],
                  ["CAMP, SICK DAYS", "Enter it once, from–to", "Even after the fact, within the current week. Streaks and bonuses stay safe."],
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
              alt="A family playing a board game at the table in the evening"
              className="aspect-[16/9] w-full lg:aspect-auto lg:h-[260px]"
            />
          </div>
          <Image
            src="/landing/en/parent-phones.png"
            alt="Parent’s phones: Approve, all caught up, and the weekly payouts for Emi, Neli and Ani"
            width={714}
            height={940}
            className="h-auto w-full max-w-[520px] self-center lg:w-[714px] lg:max-w-none"
          />
        </Section>

        {/* 7 · Kids own it */}
        <Section className="bg-warning-soft" inner="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>KIDS OWN IT</Kicker>
            <H2>Their app, their streak, their money.</H2>
            <ul className="flex flex-col gap-3.5">
              {(
                [
                  [Smartphone, "Their own phone and their own PIN."],
                  [Flame, "A daily streak, with trophies at 7, 14 and 30 days."],
                  [BadgeCheck, "A monthly bonus, paid in full when they don’t miss a day."],
                  [ReceiptText, "They see what they’ve earned, and what for."],
                  [Gift, "A starter bonus to get them going."],
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
              src="/landing/en/kids-cards.png"
              alt="Next trophy in 2 days, a monthly bonus with no slip-ups so far, and the What for list of jobs and screen time"
              width={381}
              height={549}
              className="h-auto w-full max-w-[380px]"
            />
            <Photo
              src="/landing/foto-odskrtava.jpg"
              alt="A kid’s hands holding a phone in a tidy kitchen"
              className="aspect-[300/620] w-[240px] lg:w-[300px]"
            />
          </div>
        </Section>

        {/* 8 · Your rules */}
        <Section id="rules" className="bg-card" inner="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex flex-1 flex-col gap-7">
            <Kicker>YOUR RULES</Kicker>
            <H2>Every family is different. Homeworks adapts.</H2>
            <Lead>You decide what the rules are at home. And if something doesn’t work, you change it.</Lead>
            <ul className="grid gap-x-8 pt-2 sm:grid-cols-2">
              {[
                "Areas and chores, with deadlines",
                "Screen time price",
                "Paid jobs and their rewards",
                "Monthly bonus and deductions",
                "Hourly rate",
                "Trophies and starter bonus",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 border-b border-border py-3.5 text-[17px]">
                  <Check className="size-[18px] shrink-0 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Image
            src="/landing/en/settings.png"
            alt="Settings: hourly rate 150 CZK, screen time 200 CZK per hour, monthly bonus 200 CZK, deduction 50 CZK, starter bonus 100 CZK"
            width={440}
            height={573}
            className="h-auto w-full max-w-[440px] self-center"
          />
        </Section>

        {/* 9 · Coming soon: quizzes */}
        <Section className="bg-muted" inner="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex flex-1 flex-col items-start gap-7">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-info-soft px-2.5 font-mono text-[11px] font-bold tracking-[0.08em] text-info">
              <Sparkles className="size-3" /> COMING SOON
            </span>
            <H2>Screen time they earn by learning the risks of life online.</H2>
            <Lead>
              Short quizzes on media literacy and using social media wisely. The right answers earn them screen
              time.
            </Lead>
          </div>
          <div className="flex w-full flex-col gap-6 rounded-xl bg-card p-6 lg:w-[440px] lg:p-10">
            <p className="text-2xl leading-[1.2] font-bold tracking-[-0.02em] lg:text-[28px]">
              Would you want this for your kids?
            </p>
            <QuizPoll lang="en" />
            <p className="font-mono text-sm text-muted-foreground">One tap. Nothing else to fill in.</p>
          </div>
        </Section>

        {/* 10 · Story */}
        <Section className="bg-foreground text-card">
          <div className="flex max-w-[960px] flex-col gap-7">
            <Kicker className="text-subtle">WHY HOMEWORKS EXISTS</Kicker>
            <blockquote className="text-[28px] leading-[1.2] font-semibold tracking-[-0.02em] lg:text-[44px]">
              I want to give my daughters enough experience that, once they leave home, they can take
              responsibility for their own lives. Homeworks makes that mission a whole lot easier.
            </blockquote>
            <p className="font-mono text-lg font-bold tracking-[0.05em] text-subtle">Milan, dad of three daughters</p>
          </div>
        </Section>

        {/* 11 · FAQ */}
        <Section id="faq" inner="flex flex-col gap-10 lg:flex-row lg:gap-24">
          <div className="flex flex-col gap-4 lg:w-[420px] lg:shrink-0">
            <Kicker>FAQ</Kicker>
            <H2>Before you try it</H2>
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

        {/* 12 · Waitlist */}
        <Section id="waitlist" className="bg-highlight-soft" inner="flex flex-col items-center gap-6 text-center">
          <H2 className="max-w-[820px]">Running a home is a team sport. Play it together with your kids.</H2>
          <p className="text-[17px] text-muted-foreground lg:text-xl">
            We’re testing with our first families. Leave your email and we’ll reach out when there’s a spot.
          </p>
          <div className="flex w-full justify-center pt-4">
            <WaitlistForm lang="en" />
          </div>
        </Section>
      </main>
      <footer className="border-t border-border bg-highlight-soft">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[120px]">
          <p className="font-mono text-sm font-bold tracking-[0.15em]">HOMEWORKS</p>
          <p className="text-sm text-muted-foreground">The family app for homes where everyone pitches in.</p>
        </div>
      </footer>
    </div>
  );
}
