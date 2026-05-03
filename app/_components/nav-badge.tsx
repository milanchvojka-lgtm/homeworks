import { Badge } from "@/components/ui/badge";

export function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Badge
      variant="destructive"
      className="ml-1.5 h-[18px] min-w-[18px] rounded-full px-1 text-[10px] font-semibold leading-none"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
