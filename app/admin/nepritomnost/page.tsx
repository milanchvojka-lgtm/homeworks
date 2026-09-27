import { formatInTimeZone } from "date-fns-tz";
import { db } from "@/lib/db";
import { PRAGUE_TZ, startOfDayPrague, startOfMonthPrague, startOfWeekPrague } from "@/lib/time";
import { formatDayRange } from "@/app/child/_components/format";
import { AdminSubpage } from "../_components/subpage";
import { AbsenceList, type AbsenceGroup } from "./_absence-list";
import { AddAbsence } from "./_add-absence";

/** Víc → Nepřítomnost (pen HWN · 01, D24): running and upcoming absences, add from the top. */
export default async function AbsencePage() {
  const today = startOfDayPrague();
  const [kids, absences] = await Promise.all([
    db.user.findMany({
      where: { role: "CHILD" },
      select: { id: true, name: true },
      orderBy: [{ rotationOrder: "asc" }, { name: "asc" }],
    }),
    db.absence.findMany({
      where: { toDate: { gte: today } },
      include: { user: { select: { name: true, rotationOrder: true } } },
      orderBy: [{ fromDate: "asc" }, { toDate: "asc" }],
    }),
  ]);

  // One row per range + note (an absence for several children is stored per child).
  const groups = new Map<string, AbsenceGroup>();
  for (const a of absences) {
    const key = `${a.fromDate.getTime()}|${a.toDate.getTime()}|${a.note ?? ""}`;
    const g = groups.get(key) ?? {
      ids: [],
      names: [],
      when: formatDayRange(a.fromDate, a.toDate),
      note: a.note,
      running: a.fromDate <= today,
    };
    g.ids.push(a.id);
    g.names.push(a.user.name);
    groups.set(key, g);
  }
  const rows = [...groups.values()].map((g) => ({
    ...g,
    who: g.names.length === kids.length && kids.length > 1 ? "Všichni" : g.names.join(", "),
  }));

  const ymd = (d: Date) => formatInTimeZone(d, PRAGUE_TZ, "yyyy-MM-dd");
  const earliest = new Date(Math.max(startOfWeekPrague().getTime(), startOfMonthPrague().getTime()));

  return (
    <AdminSubpage title="Nepřítomnost" back="/admin/vic">
      <AddAbsence kids={kids} today={ymd(today)} earliest={ymd(earliest)} />
      {rows.length === 0 ? (
        <p className="rounded-tile border border-border bg-card px-[18px] py-6 text-center text-muted-foreground">
          Nikdo není pryč. Tábor, dovolenou nebo nemoc zadáš tady.
        </p>
      ) : (
        <AbsenceList rows={rows} />
      )}
      <p className="text-[13px] text-subtle">Proběhlé nepřítomnosti se nezobrazují.</p>
    </AdminSubpage>
  );
}
