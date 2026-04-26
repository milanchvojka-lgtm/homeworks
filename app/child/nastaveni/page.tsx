import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ChangePinForm } from "./_change-pin-form";

export default async function ChildSettingsPage() {
  const user = await getSession();
  if (!user) redirect("/");

  return (
    <div>
      <Link
        href="/child"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Zpět
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Nastavení</h1>
      <h2 className="mt-6 text-lg font-semibold">Změnit PIN</h2>
      <ChangePinForm />
    </div>
  );
}
