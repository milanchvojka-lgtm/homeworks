"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { loginAction } from "../actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Homeworks</h1>
        <p className="mb-10 text-sm text-muted-foreground">Vyber svůj profil</p>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className="group text-left"
            >
              <Card className="transition hover:border-foreground/30 hover:scale-[1.02]">
                <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white"
                    style={{ backgroundColor: u.avatarColor }}
                  >
                    {u.name[0]}
                  </div>
                  <div className="text-center">
                    <div className="text-base font-medium">{u.name}</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {u.role === "ADMIN" ? "Rodič" : "Dítě"}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="mb-6 self-start"
      >
        <ChevronLeft className="mr-1 size-4" />
        Zpět
      </Button>

      <div
        className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white ring-2 ring-border"
        style={{ backgroundColor: profile.avatarColor }}
      >
        {profile.name[0]}
      </div>
      <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Zadej 4místný PIN</p>

      <div
        className={`mt-8 flex gap-3 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < pin.length
                ? "border-foreground bg-foreground"
                : "border-border"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 h-5 text-sm text-destructive">{error}</div>

      <div className="mt-4 grid w-full max-w-xs grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <Button
            key={d}
            variant="outline"
            onClick={() => press(d)}
            disabled={isPending}
            className="h-16 text-2xl font-medium"
          >
            {d}
          </Button>
        ))}
        <div />
        <Button
          variant="outline"
          onClick={() => press("0")}
          disabled={isPending}
          className="h-16 text-2xl font-medium"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={back}
          disabled={isPending || pin.length === 0}
          className="h-16 text-2xl font-medium"
        >
          ⌫
        </Button>
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
