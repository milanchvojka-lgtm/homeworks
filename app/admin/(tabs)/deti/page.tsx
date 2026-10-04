import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { getWeekTotals } from "@/lib/credit";
import { startOfDayPrague } from "@/lib/time";
import { absentUserIds } from "@/lib/absence";

/** "zbývá 1 z 3", "zbývají 2 z 3"; non-breaking spaces keep "2 z 3" on one line. */
function remaining(open: number, total: number): string {
  return `${open >= 2 && open <= 4 ? "zbývají" : "zbývá"} ${open}\u00a0z\u00a0${total}`;
}

/**
 * Děti (pen HWR · 02): one row per child in rotation order, this week's earnings, today's role and
 * what is left (D32). A role nobody covers today (child away, D24) gets its own line.
 */
export default async function AdminChildrenPage() {
  const today = startOfDayPrague();
  const [assignments, away] = await Promise.all([
    db.competencyAssignment.findMany({
      where: { date: today },
      select: { userId: true, competency: { select: { name: true, order: true } } },
    }),
    absentUserIds(),
  ]);
  const roleOf = new Map(assignments.map((a) => [a.userId, a.competency.name]));
  const children = await db.user.findMany({
    where: { role: "CHILD" },
    select: {
      id: true,
      name: true,
      avatarColor: true,
      _count: { select: { pushSubscriptions: { where: { disabledAt: null } } } },
    },
    orderBy: [{ rotationOrder: "asc" }, { name: "asc" }],
  });
  const rows = await Promise.all(
    children.map(async (c) => {
      const [week, todayChecks] = await Promise.all([
        getWeekTotals(c.id),
        db.dailyCheckInstance.findMany({
          where: { userId: c.id, date: today },
          select: { status: true },
        }),
      ]);
      const open = todayChecks.filter((x) => x.status === "PENDING" || x.status === "REJECTED").length;
      const role = roleOf.get(c.id);
      const status = away.has(c.id)
        ? "dnes pryč"
        : todayChecks.length === 0
          ? "dnes bez povinností"
          : open === 0
            ? "hotovo"
            : remaining(open, todayChecks.length);
      const sub = role && !away.has(c.id) ? `${role} · ${status}` : status;
      return { id: c.id, name: c.name, avatarColor: c.avatarColor, earned: week.earnedCzk, sub, remindersOff: c._count.pushSubscriptions === 0 };
    }),
  );

  const uncovered = assignments
    .filter((a) => away.has(a.userId))
    .sort((a, b) => a.competency.order - b.competency.order);

  return (
    <>
      {rows.map((c) => (
        <Link
          key={c.id}
          href={`/admin/deti/${c.id}`}
          className="flex min-h-[72px] items-center gap-3 rounded-tile border border-border bg-card pr-3.5 pl-4"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
            style={{ backgroundColor: c.avatarColor }}
          >
            {c.name[0]}
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-[17px] font-semibold">{c.name}</span>
            <span className="text-sm text-muted-foreground">{c.sub}</span>
            {/* D28 (pen HWP · 04): only when the child has no device with reminders on. */}
            {c.remindersOff && <span className="text-[13px] text-subtle">připomínky vypnuté</span>}
          </span>
          <span className="font-mono text-[17px] font-bold">{c.earned} Kč</span>
          <ChevronRight className="size-[18px] text-subtle" />
        </Link>
      ))}
      {uncovered.map((a) => (
        <p key={a.userId} className="text-sm text-subtle">
          {a.competency.name} · dnes nikdo ({rows.find((c) => c.id === a.userId)?.name} pryč)
        </p>
      ))}
      <p className="text-[13px] text-subtle">Částka = vyděláno tento týden (úkoly a odměny).</p>
    </>
  );
}
