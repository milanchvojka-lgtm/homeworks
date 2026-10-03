import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { OwnPinForm } from "./_own-pin-form";

/** D25 (pen HWU · 05): the child must replace the parent-set PIN before using the app. */
export default async function OwnPinPage() {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");
  if (!user.onboardedAt) redirect("/uvitani");
  if (!user.pinIsTemporary) redirect("/child");

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background px-4 pt-[max(3.25rem,env(safe-area-inset-top))] pb-[max(2.125rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-4 pt-10">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Lock className="size-[26px]" />
        </span>
        <h1 className="text-[28px] font-bold tracking-tight">Nastav si vlastní PIN</h1>
        <p className="text-[17px] leading-snug text-muted-foreground">
          Aby se za tebe nikdo nepřihlásil. PIN si zapamatuj, nikomu ho neříkej.
        </p>
      </div>
      <OwnPinForm />
    </main>
  );
}
