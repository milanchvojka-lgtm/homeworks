import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/showcase"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Showcase
          </Link>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
            Homeworks v1.1 · Demo
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
