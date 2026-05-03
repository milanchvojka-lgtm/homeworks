import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { CompetencyEditor } from "./_competency-editor";

export default async function CompetencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const competency = await db.competency.findUnique({
    where: { id },
    include: { dailyChecks: { orderBy: { order: "asc" } } },
  });
  if (!competency) notFound();

  return (
    <div>
      <Link
        href="/admin/kompetence"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Kompetence
      </Link>
      <CompetencyEditor
        competency={{
          id: competency.id,
          name: competency.name,
          description: competency.description,
        }}
        checks={competency.dailyChecks.map((c) => ({
          id: c.id,
          name: c.name,
          timeOfDay: c.timeOfDay,
        }))}
      />
    </div>
  );
}
