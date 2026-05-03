import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { StreakBanner } from "@/components/streak/streak-banner";
import {
  ANI_PROFILE,
  ANI_BONUS,
  ANI_TODAY_CHECKS,
  ANI_COMPETENCY,
} from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };
const limeBg = { backgroundColor: "var(--chart-1)" };

function statusLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "Schváleno";
    case "SUBMITTED":
      return "Čeká";
    case "PENDING":
      return "Nesplněno";
    default:
      return status;
  }
}

function statusVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "SUBMITTED":
      return "secondary";
    case "PENDING":
      return "outline";
    default:
      return "outline";
  }
}

export default function AniDnes() {
  const doneCount = ANI_TODAY_CHECKS.filter(
    (c) => c.status === "APPROVED" || c.status === "SUBMITTED",
  ).length;

  return (
    <div className="mx-auto max-w-md space-y-4">
      {/* Streak header */}
      <div className="flex items-center gap-2">
        <Flame className="size-4" fill="var(--chart-1)" style={limeStyle} />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Den {ANI_PROFILE.currentStreak} streaku · Tier: Gold
        </span>
      </div>

      {/* Streak banner — reusing the real component */}
      <StreakBanner
        currentStreak={ANI_PROFILE.currentStreak}
        longestStreak={ANI_PROFILE.longestStreak}
        bonus={ANI_BONUS}
      />

      {/* Trofeje link card */}
      <Link href="/showcase/ani/trofeje">
        <Card className="transition-all hover:border-primary/40 cursor-pointer">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-base">🏆</span>
              <div>
                <div className="text-sm font-bold">Trofeje</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  4 / 6 získáno · Centurion za 53 dní
                </div>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">→</span>
          </CardContent>
        </Card>
      </Link>

      {/* Streak grid link card */}
      <Link href="/showcase/ani/streak">
        <Card className="transition-all hover:border-primary/40 cursor-pointer">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-base">📅</span>
              <div>
                <div className="text-sm font-bold">Můj streak</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Posledních 12 týdnů →
                </div>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">→</span>
          </CardContent>
        </Card>
      </Link>

      {/* Competency */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Aktuální kompetence
          </div>
          <div className="mt-1 text-sm font-semibold tracking-tight">
            {ANI_COMPETENCY}
          </div>
        </CardContent>
      </Card>

      {/* Today checks */}
      <Card>
        <CardContent className="px-0 pt-0 pb-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Dnešní cheky
            </div>
            <div className="text-xs font-semibold tabular-nums">
              <span style={limeStyle}>{doneCount}</span>
              <span className="text-muted-foreground">/{ANI_TODAY_CHECKS.length}</span>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {ANI_TODAY_CHECKS.map((check) => {
              const isApproved = check.status === "APPROVED";
              const isSubmitted = check.status === "SUBMITTED";
              return (
                <li
                  key={check.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox visual */}
                    <div
                      className="flex size-4 items-center justify-center rounded-sm border"
                      style={
                        isApproved
                          ? { ...limeBg, borderColor: "var(--chart-1)" }
                          : isSubmitted
                            ? { borderColor: "var(--chart-1)" }
                            : {}
                      }
                    >
                      {isApproved && (
                        <svg
                          viewBox="0 0 12 12"
                          className="size-3"
                          fill="none"
                          stroke="var(--background)"
                          strokeWidth="2.5"
                        >
                          <path d="M2 6l3 3 5-6" />
                        </svg>
                      )}
                      {isSubmitted && (
                        <div className="size-2 rounded-sm" style={limeBg} />
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-sm ${isApproved ? "text-muted-foreground line-through" : "font-medium"}`}
                      >
                        {check.name}
                      </span>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {check.timeOfDay === "MORNING"
                          ? "Ráno"
                          : check.timeOfDay === "EVENING"
                            ? "Večer"
                            : "Kdykoli"}
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusVariant(check.status)} className="text-[9px]">
                    {statusLabel(check.status)}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
