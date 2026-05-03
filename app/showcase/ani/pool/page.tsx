import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ANI_POOL_TASKS } from "@/app/showcase/_data";
import { Avatar } from "@/app/showcase/_components/avatar";

const limeStyle = { color: "var(--chart-1)" };

export default function AniPool() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Pool</h1>
      <div className="space-y-3">
        {ANI_POOL_TASKS.map((task) => (
          <Card key={task.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{task.name}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {task.durationMin} min
                    </span>
                    {task.note && (
                      <span className="text-[10px] text-muted-foreground">
                        · {task.note}
                      </span>
                    )}
                  </div>
                  {task.waitingFor && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Avatar
                        name={task.waitingFor.name}
                        color={task.waitingFor.avatarColor}
                        size="sm"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        čeká na {task.waitingFor.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold tabular-nums" style={limeStyle}>
                    {task.rewardCzk} Kč
                  </span>
                  <Button
                    size="sm"
                    variant={task.waitingFor ? "outline" : "default"}
                    disabled={!!task.waitingFor}
                    className="text-xs"
                  >
                    {task.waitingFor ? "Obsazeno" : "Vzít si"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
