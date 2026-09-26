import { Check } from "lucide-react";

/** "Na dnešek máš hotovo" (návrh 2, pen `DayDone`) — replaces the list when nothing is left to do. */
export function DayDone({ waitingCount }: { waitingCount: number }) {
  return (
    <section className="flex flex-col items-center gap-1.5 rounded-tile border border-border bg-card px-[18px] py-[22px] text-center">
      <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-success-soft">
        <Check className="size-[22px] text-success" />
      </span>
      <h2 className="text-[19px] font-bold tracking-tight">Na dnešek máš hotovo</h2>
      <p className="text-sm text-muted-foreground">
        {waitingCount === 0
          ? "Všechno je schválené."
          : `Rodič ještě schvaluje ${waitingCount} ${waitingCount === 1 ? "povinnost" : waitingCount < 5 ? "povinnosti" : "povinností"}.`}
      </p>
    </section>
  );
}
