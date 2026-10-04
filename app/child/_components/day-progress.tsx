import type { CheckStatus } from "@prisma/client";

const SEGMENT: Record<CheckStatus, string> = {
  PENDING: "bg-muted",
  REJECTED: "bg-muted",
  SUBMITTED: "bg-warning",
  APPROVED: "bg-success",
  MISSED: "bg-muted",
};

/**
 * Today's role and progress (pen HWD · 02B, D32): "DNES: KUCHYŇ A STŮL · 1 Z 3 HOTOVO" and one
 * segment per check in card order. Done = sent or approved; extra tasks never count.
 */
export function DayProgress({ role, statuses }: { role: string; statuses: CheckStatus[] }) {
  const done = statuses.filter((s) => s === "SUBMITTED" || s === "APPROVED").length;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.12em] uppercase">
        <h2>Dnes: {role}</h2>
        <span className="ml-auto text-muted-foreground">
          {done} z {statuses.length} hotovo
        </span>
      </div>
      <div className="flex gap-1" aria-hidden>
        {statuses.map((s, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-[3px] ${SEGMENT[s]}`} />
        ))}
      </div>
    </div>
  );
}
