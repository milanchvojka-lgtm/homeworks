import { Card, CardContent } from "@/components/ui/card";
import { MILAN_COMPETENCIES } from "@/app/showcase/_data";
import { Avatar } from "@/app/showcase/_components/avatar";

export default function MilanKompetence() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Kompetence</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {MILAN_COMPETENCIES.map((comp) => (
          <Card key={comp.id}>
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="text-lg font-bold">{comp.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {comp.checksCount} denní cheky
              </div>
              <div className="flex items-center gap-2">
                <Avatar
                  name={comp.assignedTo.name}
                  color={comp.assignedTo.avatarColor}
                  size="sm"
                />
                <span className="text-xs text-muted-foreground">
                  {comp.assignedTo.name} · tento týden
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
