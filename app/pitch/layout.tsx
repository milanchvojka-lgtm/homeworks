import type { Metadata } from "next";
import { Geist, Newsreader, Funnel_Sans } from "next/font/google";

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const funnelSans = Funnel_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-funnel",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Homeworks · pitch",
  description: "Pitch od Milana — pro Teri.",
  robots: { index: false, follow: false },
};

export default function PitchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geist.variable} ${newsreader.variable} ${funnelSans.variable} flex min-h-full justify-center bg-zinc-100 font-[family-name:var(--font-geist)]`}
    >
      <div className="w-full max-w-[480px] bg-white text-[#1A1A1A] shadow-[0_0_60px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </div>
  );
}
