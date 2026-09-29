import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { getWeekTotals } from "@/lib/credit";
import { startOfDayPrague } from "@/lib/time";

/** "zbývá 1 povinnost", "zbývají 2 povinnosti", "zbývá 5 povinností". */
function remaining(n: number): string {
  if (n === 1) return "dnes zbývá 1 povinnost";
  if (n >= 2 && n <= 4) return `dnes zbývají ${n} povinnosti`;
  return `dnes zbývá ${n} povinností`;
}

/** Děti (pen HWR · 02): one row per child in rotation order, this week's earnings and what is left today. */
export default async function AdminChildrenPage() {
  const today = startOfDayPrague();
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
      const sub =
        todayChecks.length === 0 ? "dnes bez povinností" : open === 0 ? "dnes hotovo" : remaining(open);
      return { id: c.id, name: c.name, avatarColor: c.avatarColor, earned: week.earnedCzk, sub, remindersOff: c._count.pushSubscriptions === 0 };
    }),
  );

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
      <p className="text-[13px] text-subtle">Částka = vyděláno tento týden (úkoly a odměny).</p>
    </>
  );
}
