import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getAppSettings } from "@/lib/credit";
import { getCurrentAssignment } from "@/lib/rotation";
import { WelcomeFlow } from "./_welcome-flow";

/** D25 first launch (pen HWU · 01–04): 4 steps with real data, then own PIN, then Dnes. */
export default async function WelcomePage() {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");
  if (user.onboardedAt) redirect(user.pinIsTemporary ? "/uvitani/pin" : "/child");

  const [assignment, offer, settings] = await Promise.all([
    getCurrentAssignment(user.id),
    db.taskInstance.findFirst({
      where: { status: "AVAILABLE" },
      include: { task: { select: { name: true, valueCzk: true, timeEstimateMinutes: true } } },
      orderBy: { task: { valueCzk: "desc" } },
    }),
    getAppSettings(),
  ]);

  return (
    <WelcomeFlow
      competency={assignment?.competency.name ?? null}
      offer={offer ? { name: offer.task.name, valueCzk: offer.task.valueCzk, minutes: offer.task.timeEstimateMinutes } : null}
      bonusCzk={settings.welcomeBonusCzk}
    />
  );
}
