import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MILAN_INBOX } from "@/app/showcase/_data";
import { Avatar } from "@/app/showcase/_components/avatar";

const limeStyle = { color: "var(--chart-1)" };

function kindLabel(kind: "check" | "task" | "screen") {
  if (kind === "check") return "Check";
  if (kind === "task") return "Úkol";
  return "Obrazovka";
}

function kindVariant(
  kind: "check" | "task" | "screen",
): "default" | "secondary" | "outline" {
  if (kind === "check") return "default";
  if (kind === "task") return "secondary";
  return "outline";
}

export default function MilanInbox() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <div className="space-y-3">
        {MILAN_INBOX.map((group) => (
          <Card key={group.userId}>
            <CardContent className="px-4 pt-3 pb-3">
              {/* Group header */}
              <div className="mb-3 flex items-center gap-2">
                <Avatar name={group.userName} color={group.avatarColor} size="sm" />
                <span className="text-sm font-semibold">{group.userName}</span>
                <Badge variant="outline" className="ml-auto text-[10px] tabular-nums">
                  {group.items.length}
                </Badge>
              </div>
              <ul className="divide-y divide-border -mx-4 px-4">
                {group.items.map((item) => (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.title}</span>
                          <Badge
                            variant={kindVariant(item.kind)}
                            className="text-[9px] uppercase tracking-wider"
                          >
                            {kindLabel(item.kind)}
                          </Badge>
                          {item.amountCzk && (
                            <span className="text-xs font-semibold" style={limeStyle}>
                              {item.amountCzk} Kč
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.subtitle} · {item.submittedAt}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="default" size="sm" disabled>
                          Schválit
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Vrátit
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
