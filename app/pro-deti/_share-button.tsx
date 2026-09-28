"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// "Pošli to našim" (D27): shares the parents' page via the phone's share sheet, else copies the link.
export function ShareToParents({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/pro-rodice`;
    const data = {
      title: "Homeworks",
      text: "Mrkni na tohle, chci to zkusit: appka na domácí povinnosti a kapesné.",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.location.href = url;
    }
  }

  return (
    <button type="button" onClick={share} className={cn(buttonVariants(), "h-14 px-[30px] text-lg", className)}>
      {copied ? <Check className="size-5" /> : <Send className="size-5" />}
      {copied ? "Odkaz zkopírovaný" : "Pošli to našim"}
    </button>
  );
}
