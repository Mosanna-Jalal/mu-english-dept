import Link from "next/link";
import type { CSSProperties } from "react";
import { Portrait } from "@/components/Portrait";
import { catalogueNo } from "@/lib/format";
import type { College, Faculty } from "@/lib/types";
import { TypeBadge } from "./TypeBadge";

export function FacultyCard({
  person,
  college,
  index = 0,
  showCollege = true,
}: {
  person: Faculty;
  college?: College;
  index?: number;
  showCollege?: boolean;
}) {
  return (
    <Link
      href={`/faculty/${person.slug}`}
      className="catalogue-card rise group flex min-h-[214px] flex-col"
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex h-[38px] items-center justify-between px-4">
        <span className="font-mono text-[0.65rem] tracking-[0.14em] text-muted">{catalogueNo(person.serial)}</span>
        {person.isHead ? (
          <span className="stamp">Head of Dept.</span>
        ) : (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">English</span>
        )}
      </div>

      <div className="flex flex-1 gap-4 px-4 pb-10 pt-4">
        <Portrait photo={person.photo} name={person.name} sizes="96px" className="w-[88px] shrink-0 self-start" monogramSize="text-2xl" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.15rem] font-medium leading-[1.2] text-ink transition-colors group-hover:text-accent-ink">
            {person.name}
          </h3>
          <p className="mt-1 text-[0.8rem] font-medium text-accent-ink smallcaps">{person.designation}</p>
          {person.additionalRole && <p className="text-[0.78rem] italic text-muted">{person.additionalRole}</p>}
          {showCollege && college && (
            <p className="mt-2.5 text-[0.84rem] leading-snug text-ink-soft">
              {college.shortName}
              {college.location && <span className="text-muted">, {college.location}</span>}
            </p>
          )}
          {showCollege && college && <TypeBadge type={college.type} className="mt-1.5" />}
          {person.specialization.length > 0 && (
            <p className="mt-2.5 line-clamp-2 text-[0.75rem] leading-snug text-muted">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">Subjects · </span>
              {person.specialization.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
