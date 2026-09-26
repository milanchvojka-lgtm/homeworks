import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NavBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <Badge variant="count" className={cn("ml-1.5", className)}>
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
