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
  title: "Homeworks · ukázka",
  description: "Klikací prototyp Homeworks. Zástupná data.",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geist.variable} ${newsreader.variable} ${funnelSans.variable} flex min-h-full flex-col items-center bg-zinc-100 font-[family-name:var(--font-geist)]`}
    >
      <div className="w-full max-w-[480px] flex-1 bg-white text-[#1A1A1A] shadow-[0_0_60px_rgba(0,0,0,0.04)]">
        {/* Mockup banner */}
        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-2 text-[11px] text-amber-900 font-[family-name:var(--font-funnel)]">
          <span className="font-semibold tracking-[0.18em]">UKÁZKA</span>
          <span className="opacity-70">Zástupná data, nic se neukládá.</span>
        </div>
        {children}
      </div>
    </div>
  );
}
