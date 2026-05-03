import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { AniBottomNav } from "./_ani-bottom-nav";

export default function AniShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#f59e0b" }}
          >
            A
          </div>
          <span className="text-sm font-semibold">Ani · DEMO</span>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            DEMO
          </Badge>
        </div>

        {/* Right: showcase link + theme toggle */}
        <div className="flex items-center gap-1">
          <Link
            href="/showcase"
            className="inline-flex h-7 items-center rounded-lg px-2 text-[0.8rem] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ← Showcase
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">{children}</main>

      <AniBottomNav />
    </div>
  );
}
