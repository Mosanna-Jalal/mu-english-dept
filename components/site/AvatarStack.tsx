import Image from "next/image";
import { initials, photoSrc } from "@/lib/format";
import type { Faculty } from "@/lib/types";

export function AvatarStack({ people, max = 5 }: { people: Faculty[]; max?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span
          key={p.id}
          className="relative -ml-2 grid size-9 place-items-center overflow-hidden rounded-full border-2 border-card bg-paper-deep text-[0.65rem] font-medium text-muted first:ml-0"
          style={{ zIndex: shown.length - i }}
          title={p.name}
        >
          {p.photo ? (
            <Image src={photoSrc(p.photo, { aspect: "1:1" })} alt="" fill sizes="36px" className="object-cover" />
          ) : (
            initials(p.name)
          )}
        </span>
      ))}
      {extra > 0 && (
        <span className="-ml-2 grid size-9 place-items-center rounded-full border-2 border-card bg-ink font-mono text-[0.6rem] text-paper">+{extra}</span>
      )}
    </div>
  );
}
