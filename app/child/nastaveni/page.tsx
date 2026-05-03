import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
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
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            ZMĚNIT PIN
          </div>
          <ChangePinForm />
        </CardContent>
      </Card>

      {/* Theme card */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            MOTIV
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Přepnout světlý / tmavý režim
            </span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
