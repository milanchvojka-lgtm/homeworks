import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ShowcaseIndex() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
        <Link
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Domů
        </Link>
        <ThemeToggle />
      </div>

      <main className="mx-auto max-w-lg space-y-8 px-4 py-10 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Homeworks v1.1 · Interní demo
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Showcase</h1>
          <p className="text-sm text-muted-foreground">
            Navigovatelné demo bez autentizace a databáze — každá obrazovka zvlášť,
            stejná navigace jako v reálné aplikaci. Realistická data, den 47 streaku.
          </p>
        </div>

        {/* Tiles */}
        <div className="grid gap-4">
          <Link href="/showcase/milan">
            <Card className="transition-all hover:border-primary/60 hover:shadow-md group cursor-pointer">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl text-white text-xl font-bold" style={{ backgroundColor: "#2563eb" }}>
                    M
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-[0.15em]">Admin</Badge>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Pohled rodiče · Milan</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Inbox, Kompetence, Úkoly, Výplaty, Uživatelé, Nastavení — navigace
                    přes horní tabs jako v reálné admin sekci.
                  </p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground group-hover:text-primary transition-colors">
                  /showcase/milan →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/showcase/ani">
            <Card className="transition-all hover:border-primary/60 hover:shadow-md group cursor-pointer">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl text-white text-xl font-bold" style={{ backgroundColor: "#f59e0b" }}>
                    A
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-[0.15em]">Dítě</Badge>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Pohled dítěte · Ani</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dnes, Pool, Mé úkoly, Kredit, Historie — navigace přes spodní
                    lištu jako v reálné child sekci. Trofeje a Streak přístupné z Dnes.
                  </p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground group-hover:text-primary transition-colors">
                  /showcase/ani →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer note */}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold">Scénář:</span> Den 47 streaku · Pondělí 3. května 2026 ·
            Ani má 4 denní cheky (2 schváleny, 1 čeká, 1 pending) · Kredit 1 240 Kč ·
            Trofeje 4/6 (cíl: Centurion 100 dnů).
          </p>
        </div>
      </main>
    </div>
  );
}
