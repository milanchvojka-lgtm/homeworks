"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOwnPinAction } from "@/app/actions/welcome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ERRORS: Record<string, string> = {
  invalid_pin: "PIN musí mít 4 číslice.",
  mismatch: "PINy se neshodují.",
  too_simple: "Vyber si jiný PIN než 0000.",
  same_as_temporary: "Vyber si jiný PIN, než ti dali rodiče.",
};

export function OwnPinForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      setError(null);
      const res = await setOwnPinAction(pin, again);
      if (res.ok) router.replace(res.next);
      else setError(ERRORS[res.error] ?? "Nepovedlo se, zkus to znovu.");
    });

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">{label}</span>
      <Input
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        value={value}
        onChange={(e) => set(e.target.value.replace(/\D/g, ""))}
        className="tracking-[0.4em]"
      />
    </label>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 pt-4">
      {field("Nový PIN", pin, setPin)}
      {field("Znovu", again, setAgain)}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex-1" />
      <Button className="w-full" onClick={save} disabled={isPending || pin.length < 4 || again.length < 4}>
        Uložit PIN
      </Button>
    </div>
  );
}
