"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { endAbsenceAction } from "@/app/actions/absence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AbsenceGroup = {
  ids: string[];
  names: string[];
  when: string;
  note: string | null;
  running: boolean;
};

/** Pen `AbsenceRow`: who, when · note, PROBÍHÁ; cancel an upcoming one, end a running one. */
export function AbsenceList({ rows }: { rows: (AbsenceGroup & { who: string })[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const end = (ids: string[]) =>
    startTransition(async () => {
      for (const id of ids) await endAbsenceAction(id);
      router.refresh();
    });

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li
          key={r.ids.join(",")}
          className="flex items-center gap-3 rounded-tile border border-border bg-card py-3.5 pr-3.5 pl-[18px]"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Plane className="size-[18px] text-muted-foreground" />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span className="text-[17px] font-semibold">{r.who}</span>
              {r.running && <Badge variant="info">Probíhá</Badge>}
            </span>
            <span className="font-mono text-xs font-bold text-muted-foreground">
              {r.when}
              {r.note ? ` · ${r.note}` : ""}
            </span>
          </span>
          <Button variant="outline" className="h-10 px-3.5" disabled={isPending} onClick={() => end(r.ids)}>
            {r.running ? "Ukončit" : "Zrušit"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
