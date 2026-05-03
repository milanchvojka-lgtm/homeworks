"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { changePinAction } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePinForm() {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);

    if (!/^\d{4}$/.test(newPin)) {
      setError("Nový PIN musí mít 4 číslice.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("Nové PINy se neshodují.");
      return;
    }

    startTransition(async () => {
      const res = await changePinAction(oldPin, newPin);
      if (!res.ok) {
        setError(
          res.error === "wrong_pin"
            ? "Starý PIN nesedí."
            : "Nepovedlo se změnit PIN.",
        );
        return;
      }
      setDone(true);
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
    });
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--chart-1)" }}>
        <CheckCircle2 className="size-4 shrink-0" />
        <span>PIN změněn. Příště se přihlas novým PINem.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PinField label="Starý PIN" value={oldPin} onChange={setOldPin} />
      <PinField label="Nový PIN" value={newPin} onChange={setNewPin} />
      <PinField
        label="Nový PIN ještě jednou"
        value={confirmPin}
        onChange={setConfirmPin}
      />
      {error && <div className="text-xs text-destructive">{error}</div>}
      <Button
        className="w-full"
        onClick={submit}
        disabled={
          isPending ||
          oldPin.length !== 4 ||
          newPin.length !== 4 ||
          confirmPin.length !== 4
        }
      >
        Změnit PIN
      </Button>
    </div>
  );
}

function PinField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="font-mono text-lg tracking-widest text-center"
      />
    </div>
  );
}
