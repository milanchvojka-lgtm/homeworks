import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { MilanTopNav } from "./_milan-top-nav";

export default function MilanShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#2563eb" }}
          >
            M
          </div>
          <span className="text-sm font-medium">Milan · DEMO</span>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            DEMO
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Separator orientation="vertical" className="h-5" />
          <Link
            href="/showcase"
            className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ← Showcase
          </Link>
        </div>
      </header>

      {/* Top nav tabs */}
      <MilanTopNav />

      {/* Page content */}
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
