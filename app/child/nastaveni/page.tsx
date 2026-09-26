import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ChangePinForm } from "./_change-pin-form";

export default async function ChildSettingsPage() {
  const user = await getSession();
  if (!user) redirect("/");

  return (
    <div className="space-y-3">
      <Link
        href="/child"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Zpět
      </Link>

      {/* PIN card */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            ZMĚNIT PIN
          </div>
          <ChangePinForm />
        </CardContent>
      </Card>
    </div>
  );
}
