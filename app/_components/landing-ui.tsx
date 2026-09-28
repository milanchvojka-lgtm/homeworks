import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared building blocks of the landing pages /pro-rodice (D26) and /pro-deti (D27).

export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs font-bold tracking-[0.15em] text-muted-foreground lg:text-[13px]", className)}>
      {children}
    </p>
  );
}

export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[32px] leading-[1.08] font-bold tracking-[-0.025em] text-balance lg:text-[52px]", className)}>
      {children}
    </h2>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-[17px] leading-[1.55] text-muted-foreground lg:text-xl">{children}</p>;
}

export function Section({
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

export function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-tile bg-muted", className)}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
    </div>
  );
}

type Link = readonly [href: string, label: string];

export function LandingHeader({
  nav,
  cta,
  dark = false,
}: {
  nav: readonly Link[];
  cta: Link;
  dark?: boolean;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 backdrop-blur",
        dark ? "bg-foreground/95 text-card" : "bg-highlight-soft/95",
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-10 lg:px-[120px] lg:py-7">
        <a href="#" className="font-mono text-sm font-bold tracking-[0.2em]">
          HOMEWORKS
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-medium xl:flex">
          {nav.map(([href, label]) => (
            <a key={href} href={href} className={dark ? "hover:text-subtle" : "hover:text-muted-foreground"}>
              {label}
            </a>
          ))}
          <a href={cta[0]} className="font-bold underline underline-offset-4">
            {cta[1]}
          </a>
        </nav>
        <details className="group relative xl:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden">
            <Menu className="size-6" aria-label="Menu" />
          </summary>
          <nav className="absolute right-0 top-12 flex w-60 flex-col rounded-xl bg-card p-2 text-base font-medium text-foreground shadow-lg ring-1 ring-border">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-3 hover:bg-muted">
                {label}
              </a>
            ))}
            <a href={cta[0]} className="rounded-lg px-3 py-3 font-bold underline underline-offset-4 hover:bg-muted">
              {cta[1]}
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
