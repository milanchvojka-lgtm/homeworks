import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ANI_MY_TASKS } from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

export default function AniMeUkoly() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Mé úkoly</h1>
      {ANI_MY_TASKS.map((task) => (
        <Card key={task.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{task.name}</span>
                  <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                    Přijato
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  <span>Splnit do {task.executeDeadline}</span>
                  <span style={limeStyle} className="font-semibold">
                    · zbývá 2 h 12 m
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold tabular-nums" style={limeStyle}>
                {task.rewardCzk} Kč
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" disabled>
                Odevzdat
              </Button>
              <Button size="sm" variant="outline" disabled>
                Vrátit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
