import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { AvatarStack } from "@/components/site/AvatarStack";
import { TypeBadge } from "@/components/site/TypeBadge";
import { COLLEGE_TYPES } from "@/lib/constants";
import { getRegister } from "@/lib/data";
import type { College, Faculty } from "@/lib/types";

export const metadata: Metadata = {
  title: "Colleges & institutions",
  description: "The University Department, constituent, government, minority and affiliated colleges of Magadh University, with their English faculty.",
};

export default async function CollegesPage() {
  const { colleges, faculty } = await getRegister();
  const byCollege = new Map<string, Faculty[]>();
  for (const p of faculty) byCollege.set(p.collegeId, [...(byCollege.get(p.collegeId) ?? []), p]);
  const districts = new Set(colleges.map((c) => c.district).filter(Boolean)).size;

  return (
    <>
      <section className="border-b border-rule">
        <div className="shell pb-12 pt-14 md:pt-20">
          <p className="eyebrow rise">Colleges &amp; institutions</p>
          <h1 className="rise mt-5 max-w-4xl font-display text-[2.6rem] leading-[1.02] sm:text-[3.6rem]" style={{ "--i": 1 } as CSSProperties}>
            {colleges.length} institutions across {districts} districts of South Bihar.
          </h1>
          <p className="rise mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft" style={{ "--i": 2 } as CSSProperties}>
            The list follows Magadh University&apos;s own register of constituent, minority and affiliated colleges, plus the University Department and government colleges. Open a college to see its
            Department of English.
          </p>
          <nav aria-label="Jump to a category" className="rise mt-9 flex flex-wrap gap-2" style={{ "--i": 3 } as CSSProperties}>
            {COLLEGE_TYPES.map((t) => {
              const n = colleges.filter((c) => c.type === t.value).length;
              if (!n) return null;
              return (
                <a key={t.value} href={`#${t.value}`} className="chip">
                  <span className={`type-badge type-${t.value} !text-[0px]`} aria-hidden />
                  {t.plural}
                  <span className="count">{n}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </section>

      {COLLEGE_TYPES.map((t) => {
        const list = colleges.filter((c) => c.type === t.value);
        if (!list.length) return null;
        const facultyTotal = list.reduce((n, c) => n + c.facultyCount, 0);
        return (
          <section key={t.value} id={t.value} className="shell scroll-mt-32 pt-16">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
              <div>
                <span className="drawer-label">{t.plural}</span>
                <p className="mt-3 max-w-xl text-[0.95rem] text-muted">{t.blurb}</p>
              </div>
              <p className="font-mono text-[0.75rem] text-muted">
                {list.length} {list.length === 1 ? "institution" : "institutions"} · {facultyTotal} faculty recorded
              </p>
            </header>
            {t.value === "affiliated" ? (
              <AffiliatedTable list={list} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c, i) => (
                  <CollegeCard key={c.id} college={c} people={byCollege.get(c.id) ?? []} index={i} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

function statusLine(c: College) {
  if (c.facultyCount > 0) return null;
  if (c.englishStatus === "vacant") return "English post shown as vacant";
  if (c.englishSeats === 0) return "No B.A. English programme";
  if (c.englishSeats) return `B.A. English · ${c.englishSeats} seats · faculty not yet recorded`;
  return "English faculty not yet recorded";
}

function CollegeCard({ college: c, people, index }: { college: College; people: Faculty[]; index: number }) {
  const status = statusLine(c);
  return (
    <Link
      href={`/colleges/${c.slug}`}
      className="catalogue-card rise group flex min-h-[210px] flex-col !bg-none"
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex h-[38px] items-center justify-between px-5">
        <TypeBadge type={c.type} />
        <span className="font-mono text-[0.65rem] text-muted">{c.district || "—"}</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-10 pt-5">
        <h3 className="font-display text-[1.3rem] leading-tight transition-colors group-hover:text-accent-ink">
          {c.name}
          {c.type === "government" && c.location && !c.name.includes(c.location) ? `, ${c.location}` : ""}
        </h3>
        <p className="mt-1 text-[0.85rem] text-muted">
          {c.type === "government" && c.collegeCode
            ? `College code ${c.collegeCode}`
            : `${c.shortName !== c.name ? `${c.shortName} · ` : ""}${c.location}`}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          {people.length ? (
            <div>
              <AvatarStack people={people} />
              <p className="mt-2 text-[0.8rem] text-ink-soft">
                {people.length} English {people.length === 1 ? "teacher" : "teachers"}
              </p>
            </div>
          ) : (
            <p className="text-[0.8rem] italic text-faint">{status}</p>
          )}
          <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}

function AffiliatedTable({ list }: { list: College[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-rule bg-card">
      <table className="ledger min-w-[680px]">
        <thead>
          <tr>
            <th>College</th>
            <th>District</th>
            <th className="hidden md:table-cell">Principal</th>
            <th className="text-right">B.A. English seats</th>
            <th className="text-right">Faculty recorded</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/colleges/${c.slug}`} className="font-display text-[1rem] hover:text-accent">
                  {c.name}
                </Link>
                {c.collegeCode && <span className="ml-2 font-mono text-[0.65rem] text-faint">Code {c.collegeCode}</span>}
              </td>
              <td className="text-muted">{c.district || "—"}</td>
              <td className="hidden text-ink-soft md:table-cell">{c.principal || "—"}</td>
              <td className="text-right font-mono text-[0.8rem]">
                {c.englishSeats === null ? <span className="text-faint">—</span> : c.englishSeats === 0 ? <span className="text-faint">Not offered</span> : c.englishSeats}
              </td>
              <td className="text-right font-mono text-[0.8rem]">{c.facultyCount ? c.facultyCount : <span className="text-faint">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
