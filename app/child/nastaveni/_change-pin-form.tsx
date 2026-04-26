"use client";

import { useState, useTransition } from "react";
import { changePinAction } from "@/app/actions/users";

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
      <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        ✅ PIN změněn. Příště se přihlas novým PINem.
      </div>
    );
  }

  return (
    <div className="mt-3 max-w-sm space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <PinField label="Starý PIN" value={oldPin} onChange={setOldPin} />
      <PinField label="Nový PIN" value={newPin} onChange={setNewPin} />
      <PinField
        label="Nový PIN ještě jednou"
        value={confirmPin}
        onChange={setConfirmPin}
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button
        onClick={submit}
        disabled={
          isPending || oldPin.length !== 4 || newPin.length !== 4 ||
          confirmPin.length !== 4
        }
        className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Změnit PIN
      </button>
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
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center font-mono text-lg tracking-widest dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}
