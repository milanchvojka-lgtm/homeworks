"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions/auth";

type Profile = {
  id: string;
  name: string;
  role: "ADMIN" | "CHILD";
  avatarColor: string;
};

export function LoginScreen({ users }: { users: Profile[] }) {
  const [selected, setSelected] = useState<Profile | null>(null);

  if (!selected) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Homeworks</h1>
        <p className="mb-10 text-sm text-zinc-500">Vyber svůj profil</p>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:scale-[1.02] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white"
                style={{ backgroundColor: u.avatarColor }}
              >
                {u.name[0]}
              </div>
              <div className="text-center">
                <div className="text-base font-medium">{u.name}</div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  {u.role === "ADMIN" ? "Rodič" : "Dítě"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  return <PinPad profile={selected} onCancel={() => setSelected(null)} />;
}

function PinPad({
  profile,
  onCancel,
}: {
  profile: Profile;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (fullPin: string) => {
    setError(null);
    startTransition(async () => {
      const res = await loginAction(profile.id, fullPin);
      if (res.ok) {
        router.replace(profile.role === "ADMIN" ? "/admin" : "/child");
        return;
      }
      if (res.error === "locked") {
        setError("Příliš mnoho pokusů. Zkus to za 5 minut.");
      } else if (res.error === "not_found") {
        setError("Profil nenalezen.");
      } else {
        setError("Špatný PIN.");
      }
      setPin("");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    });
  };

  const press = (digit: string) => {
    if (isPending) return;
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) submit(next);
      return next;
    });
  };

  const back = () => {
    if (isPending) return;
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <button
        onClick={onCancel}
        className="mb-6 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Zpět
      </button>
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white"
        style={{ backgroundColor: profile.avatarColor }}
      >
        {profile.name[0]}
      </div>
      <h2 className="mt-4 text-xl font-medium">{profile.name}</h2>
      <p className="mt-1 text-sm text-zinc-500">Zadej 4místný PIN</p>

      <div
        className={`mt-8 flex gap-3 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < pin.length
                ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 h-5 text-sm text-red-600">{error}</div>

      <div className="mt-4 grid w-full max-w-xs grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <KeyButton key={d} onClick={() => press(d)} disabled={isPending}>
            {d}
          </KeyButton>
        ))}
        <div />
        <KeyButton onClick={() => press("0")} disabled={isPending}>
          0
        </KeyButton>
        <KeyButton onClick={back} disabled={isPending || pin.length === 0}>
          ⌫
        </KeyButton>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </main>
  );
}

function KeyButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 items-center justify-center rounded-xl border border-zinc-200 bg-white text-2xl font-medium shadow-sm transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {children}
    </button>
  );
}
