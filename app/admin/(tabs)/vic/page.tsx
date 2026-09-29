import Link from "next/link";
import { ChevronRight, Layers, ListChecks, Plane, Settings, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { startOfDayPrague } from "@/lib/time";
import { formatDayRange } from "@/app/child/_components/format";
import { PushSettingRow } from "@/app/_components/push-setting-row";

/** 1–4 take the short Czech plural ("3 lidé", "2 aktivní"), 0 and 5+ the genitive. */
const few = (n: number) => n >= 1 && n <= 4;

/** Víc (pen HWR · 05): rarely used things, one list, sign-out below. */
export default async function AdminMorePage() {
  const [user, activeTasks, competencies, people, awayNow] = await Promise.all([
    getSession(),
    db.task.count({ where: { isActive: true } }),
    db.competency.findMany({ orderBy: { order: "asc" }, select: { name: true } }),
    db.user.count(),
    db.absence.findMany({
      where: { fromDate: { lte: startOfDayPrague() }, toDate: { gte: startOfDayPrague() } },
      include: { user: { select: { name: true } } },
      orderBy: { toDate: "asc" },
    }),
  ]);
  const awaySub =
    awayNow.length === 0
      ? "tábor, dovolená, nemoc"
      : awayNow.map((a) => `${a.user.name} do ${formatDayRange(a.toDate, a.toDate)}`).join(", ");

  const items = [
    { href: "/admin/ukoly", Icon: ListChecks, title: "Úkoly", sub: `${activeTasks} ${few(activeTasks) ? "aktivní" : "aktivních"}` },
    { href: "/admin/nepritomnost", Icon: Plane, title: "Nepřítomnost", sub: awaySub },
    {
      href: "/admin/kompetence",
      Icon: Layers,
      title: "Kompetence",
      sub: competencies.map((c) => c.name).join(", ") || "zatím žádné",
    },
    { href: "/admin/uzivatele", Icon: UsersRound, title: "Uživatelé", sub: `${people} ${few(people) ? "lidé" : "lidí"}, PINy` },
    { href: "/admin/nastaveni", Icon: Settings, title: "Nastavení", sub: "sazby, bonus, trofeje" },
  ];

  return (
    <>
      <nav className="flex flex-col rounded-tile border border-border bg-card">
        {items.map(({ href, Icon, title, sub }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex min-h-16 items-center gap-3.5 pr-3.5 pl-4 ${i < items.length - 1 ? "border-b border-muted" : ""}`}
          >
            <Icon className="size-[22px]" />
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[17px] font-semibold">{title}</span>
              <span className="text-[13px] text-muted-foreground">{sub}</span>
            </span>
            <ChevronRight className="size-[18px] text-subtle" />
          </Link>
        ))}
      </nav>
      <PushSettingRow role="parent" />
      <div className="flex items-center gap-3 px-0.5 py-2">
        <span className="flex-1 text-[15px] text-muted-foreground">Přihlášený: {user?.name}</span>
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            Odhlásit
          </Button>
        </form>
      </div>
    </>
  );
}
