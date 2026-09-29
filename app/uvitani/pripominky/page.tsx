import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RemindersStep } from "./_reminders-step";

/** D28 first launch (pen HWP · 01 / 01b): after the own PIN, turn reminders on, then Dnes. */
export default async function WelcomeRemindersPage() {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");
  if (!user.onboardedAt) redirect("/uvitani");
  if (user.pinIsTemporary) redirect("/uvitani/pin");
  return <RemindersStep />;
}
