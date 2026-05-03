import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MILAN_TASKS } from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

export default function MilanUkoly() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Úkoly</h1>
      <Card>
        <CardContent className="px-0 pt-0 pb-0">
          <ul className="divide-y divide-border">
            {MILAN_TASKS.map((task, i) => (
              <li
                key={task.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 ${
                  !task.active ? "opacity-50" : ""
                } ${i === 0 ? "rounded-t-xl" : ""} ${
                  i === MILAN_TASKS.length - 1 ? "rounded-b-xl" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{task.name}</span>
                    <Badge
                      variant={task.active ? "default" : "outline"}
                      className="text-[9px] uppercase tracking-wider"
                    >
                      {task.active ? "aktivní" : "neaktivní"}
                    </Badge>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {task.frequency} · {task.durationMin} min
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums" style={limeStyle}>
                  {task.rewardCzk} Kč
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
