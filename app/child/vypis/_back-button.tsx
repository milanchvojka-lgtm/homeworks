"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Back to the tab the child came from (výpis opens from the header tile on any tab). */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Zpět"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/child"))}
      className="-ml-2 flex size-11 items-center justify-center"
    >
      <ArrowLeft className="size-[22px]" />
    </button>
  );
}
