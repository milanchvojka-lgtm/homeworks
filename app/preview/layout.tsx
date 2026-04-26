import type { Metadata } from "next";
import { MockBanner } from "./_shared";

export const metadata: Metadata = {
  title: "Homeworks · ukázka",
  description: "Klikací prototyp Homeworks. Zástupná data.",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-col items-center bg-zinc-200/60 font-sans">
      <div className="flex w-full max-w-[480px] flex-1 flex-col bg-white text-zinc-900 shadow-[0_0_60px_rgba(0,0,0,0.04)]">
        <MockBanner />
        {children}
      </div>
    </div>
  );
}
