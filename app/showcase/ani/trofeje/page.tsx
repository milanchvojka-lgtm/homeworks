import { Card, CardContent } from "@/components/ui/card";
import { TrophyList } from "@/components/streak/trophy-list";
import { ANI_PROFILE, ANI_TROPHIES } from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

export default function AniTrofeje() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Trofeje</h1>

      {/* Stats card */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold tabular-nums" style={limeStyle}>
                {ANI_PROFILE.currentStreak}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Aktuální
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {ANI_PROFILE.longestStreak}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Rekord
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {ANI_PROFILE.brokenStreaksCount}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Přerušení
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trophy list — reusing the real component */}
      <Card>
        <CardContent className="px-0 pt-2 pb-2">
          <TrophyList trophies={ANI_TROPHIES} />
        </CardContent>
      </Card>
    </div>
  );
}
