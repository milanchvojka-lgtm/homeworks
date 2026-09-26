import { Badge } from "@/components/ui/badge";

export function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Badge variant="count" className="ml-1.5">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
