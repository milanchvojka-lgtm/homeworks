import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  success: "bg-success-soft text-success",
  neutral: "bg-muted text-muted-foreground",
} as const;

/** Empty list (pen EmptyState): icon in a soft circle, title, one sentence. Green only when "all done". */
export function EmptyState({
  Icon,
  title,
  text,
  tone = "neutral",
  className,
}: {
  Icon: LucideIcon;
  title: string;
  text: string;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2.5 text-center", className)}>
      <span className={cn("flex size-14 items-center justify-center rounded-full", TONES[tone])}>
        <Icon className="size-7" />
      </span>
      <p className="text-[22px] font-bold tracking-tight">{title}</p>
      <p className="text-[15px] text-muted-foreground">{text}</p>
    </div>
  );
}
