import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CompetencyEditor } from "./_competency-editor";
import { AdminSubpage } from "../../_components/subpage";

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
    <AdminSubpage title={competency.name} back="/admin/kompetence">
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
          dueTime: c.dueTime,
        }))}
      />
    </AdminSubpage>
  );
}
