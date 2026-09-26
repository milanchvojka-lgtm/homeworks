import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChangePinForm } from "./_change-pin-form";

/** Change PIN (moved from former /child/nastaveni, reachable from Já). */
export default function ChildPinPage() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="/child/ja" className="flex items-center gap-2 text-[15px] font-semibold text-muted-foreground">
        <ArrowLeft className="size-[18px]" />
        Já
      </Link>
      <section className="flex flex-col gap-3 rounded-tile border border-border bg-card p-[18px]">
        <h1 className="font-mono text-xs font-bold tracking-[0.12em] uppercase">Změnit PIN</h1>
        <ChangePinForm />
      </section>
    </div>
  );
}
