"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Back to where the user came from; `fallbackHref` when the page was opened directly. */
export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Zpět"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
      className="-ml-2 flex size-11 items-center justify-center"
    >
      <ArrowLeft className="size-[22px]" />
    </button>
  );
}
