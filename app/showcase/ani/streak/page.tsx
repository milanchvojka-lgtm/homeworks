import { StreakGrid } from "@/components/streak/streak-grid";
import { generateAniStreakCells } from "@/app/showcase/_data";

const streakCells = generateAniStreakCells();

export default function AniStreak() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Streak · Posledních 12 týdnů</h1>
      <StreakGrid cells={streakCells} />
    </div>
  );
}
