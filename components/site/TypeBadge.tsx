import { typeLabel } from "@/lib/constants";
import type { CollegeType } from "@/lib/types";

export function TypeBadge({ type, className = "" }: { type: CollegeType; className?: string }) {
  return <span className={`type-badge type-${type} ${className}`}>{typeLabel(type)}</span>;
}
