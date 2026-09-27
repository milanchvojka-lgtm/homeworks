import { Plane } from "lucide-react";
import { formatDayPrague } from "./format";

/** Pen `FreeDay` (D24): shown on Dnes instead of checks while the child is away. */
export function FreeDay({ until, note }: { until: Date; note: string | null }) {
  return (
    <section className="flex flex-col items-center gap-1.5 rounded-tile border border-border bg-card px-[18px] py-[22px] text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-info-soft">
        <Plane className="size-[22px] text-info" />
      </span>
      <h2 className="text-xl font-bold tracking-tight">Máš volno do {formatDayPrague(until)}</h2>
      <p className="text-sm text-muted-foreground">
        {note ? `${note.charAt(0).toUpperCase()}${note.slice(1)}. ` : ""}Povinnosti tě nečekají, řada ani bonus se nezmění.
      </p>
    </section>
  );
}
