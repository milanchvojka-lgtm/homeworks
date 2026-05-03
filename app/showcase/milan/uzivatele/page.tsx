import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MILAN_USERS } from "@/app/showcase/_data";
import { Avatar } from "@/app/showcase/_components/avatar";

export default function MilanUzivatele() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Uživatelé</h1>
      <Card>
        <CardContent className="px-0 pt-0 pb-0">
          <ul className="divide-y divide-border">
            {MILAN_USERS.map((user, i) => (
              <li
                key={user.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i === 0 ? "rounded-t-xl" : ""
                } ${i === MILAN_USERS.length - 1 ? "rounded-b-xl" : ""}`}
              >
                <Avatar name={user.name} color={user.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    <Badge
                      variant={user.role === "ADMIN" ? "secondary" : "outline"}
                      className="text-[9px] uppercase tracking-wider"
                    >
                      {user.role === "ADMIN" ? "Admin" : "Dítě"}
                    </Badge>
                    {user.rotationOrder && (
                      <span className="text-[10px] text-muted-foreground">
                        pořadí {user.rotationOrder}
                      </span>
                    )}
                  </div>
                  {user.monthlyAllowanceCzk && (
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Kapesné {user.monthlyAllowanceCzk} Kč / měsíc
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
