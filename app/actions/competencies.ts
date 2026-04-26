"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { TimeOfDay } from "@prisma/client";

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    throw new Error("forbidden");
  }
  return user;
}

export async function updateCompetencyAction(
  id: string,
  data: { name: string; description: string | null },
): Promise<void> {
  await requireAdmin();
  await db.competency.update({
    where: { id },
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
    },
  });
  revalidatePath("/admin/kompetence");
}

export async function createDailyCheckAction(
  competencyId: string,
  data: { name: string; timeOfDay: TimeOfDay },
): Promise<void> {
  await requireAdmin();
  const last = await db.dailyCheck.findFirst({
    where: { competencyId },
    orderBy: { order: "desc" },
  });
  await db.dailyCheck.create({
    data: {
      competencyId,
      name: data.name.trim(),
      timeOfDay: data.timeOfDay,
      order: (last?.order ?? 0) + 1,
    },
  });
  revalidatePath(`/admin/kompetence/${competencyId}`);
  revalidatePath("/admin/kompetence");
}

export async function updateDailyCheckAction(
  id: string,
  data: { name: string; timeOfDay: TimeOfDay },
): Promise<void> {
  await requireAdmin();
  const updated = await db.dailyCheck.update({
    where: { id },
    data: { name: data.name.trim(), timeOfDay: data.timeOfDay },
  });
  revalidatePath(`/admin/kompetence/${updated.competencyId}`);
  revalidatePath("/admin/kompetence");
}

export async function deleteDailyCheckAction(id: string): Promise<void> {
  await requireAdmin();
  const check = await db.dailyCheck.delete({ where: { id } });
  revalidatePath(`/admin/kompetence/${check.competencyId}`);
  revalidatePath("/admin/kompetence");
}
