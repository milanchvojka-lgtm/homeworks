export type DayCell =
  | { kind: "approved" }
  | { kind: "submitted" }
  | { kind: "missed" }
  | { kind: "rejected" }
  | { kind: "future" }
  | { kind: "empty" };

export type StreakGridProps = {
  /** 84 cells, oldest first. Layout: 12 weeks × 7 days. */
  cells: DayCell[];
};

function cellClass(kind: DayCell["kind"]): string {
  switch (kind) {
    case "approved":
    case "submitted":
      return "bg-[var(--chart-1)]";
    case "missed":
      return "bg-muted";
    case "rejected":
      return "bg-destructive/70";
    case "future":
      return "border border-dashed border-border";
    case "empty":
    default:
      return "bg-muted/40";
  }
}

const DAY_LABELS = ["P", "Ú", "S", "Č", "P", "S", "N"];

export function StreakGrid({ cells }: StreakGridProps) {
  // Reshape flat 84-cell array into 12 columns × 7 rows (column-major)
  const columns: DayCell[][] = [];
  for (let w = 0; w < 12; w++) {
    columns.push(cells.slice(w * 7, w * 7 + 7));
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Posledních 12 týdnů
        </span>
        <div className="flex items-center gap-2.5 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--chart-1)]" />
            splněno
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted" />
            chybí
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-destructive/70" />
            vráceno
          </span>
        </div>
      </div>

      {/* Grid with day labels */}
      <div className="flex gap-2">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 pt-0.5">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex h-4 w-3 items-center justify-center text-[9px] leading-none text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        {/* 12 columns */}
        <div className="flex flex-1 gap-1">
          {columns.map((col, wi) => (
            <div key={wi} className="flex flex-1 flex-col gap-1">
              {col.map((cell, di) => (
                <div
                  key={di}
                  className={`h-4 w-full rounded-sm ${cellClass(cell.kind)}`}
                  title={`Týden ${wi + 1}, den ${di + 1}: ${cell.kind}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
