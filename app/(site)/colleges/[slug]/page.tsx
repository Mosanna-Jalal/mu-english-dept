import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { FacultyCard } from "@/components/site/FacultyCard";
import { TypeBadge } from "@/components/site/TypeBadge";
import { getCollegeBySlug } from "@/lib/data";
import { formatPhone, hostOf } from "@/lib/format";

// No generateStaticParams: entries added from the admin panel must render fully on their very
// first visit. The static shell is still prerendered; the record streams in from the cached register.

export async function generateMetadata({ params }: PageProps<"/colleges/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollegeBySlug(slug);
  if (!data) return { title: "Not found" };
  return {
    title: data.college.name,
    description: `Department of English at ${data.college.name}${data.college.location ? `, ${data.college.location}` : ""}, Magadh University.`,
  };
}

export default function CollegePage({ params }: PageProps<"/colleges/[slug]">) {
  return (
    <Suspense fallback={<div className="shell pt-16" aria-hidden><div className="skeleton h-40" /></div>}>
      <CollegeView params={params} />
    </Suspense>
  );
}

async function CollegeView({ params }: { params: PageProps<"/colleges/[slug]">["params"] }) {
  const { slug } = await params;
  const data = await getCollegeBySlug(slug);
  if (!data) notFound();
  const { college: c, faculty } = data;
  const heads = faculty.filter((f) => f.isHead);

  const facts: { label: string; value: ReactNode }[] = [];
  if (c.principal) facts.push({ label: c.principalTitle || "Principal", value: c.principal });
  if (c.district) facts.push({ label: "District", value: c.district });
  if (c.established) facts.push({ label: "Established", value: c.established });
  if (c.collegeCode) facts.push({ label: "College code", value: c.collegeCode });
  if (c.englishSeats !== null)
    facts.push({ label: "B.A. English seats", value: c.englishSeats > 0 ? `${c.englishSeats} (2026–30 intake)` : "Not offered (2026–30)" });
  if (c.phone) facts.push({ label: "Office phone", value: <a className="link-quiet font-mono text-[0.9rem]" href={`tel:${c.phone.replace(/\s/g, "")}`}>{formatPhone(c.phone)}</a> });
  if (c.email) facts.push({ label: "Email", value: <a className="link-quiet break-all" href={`mailto:${c.email}`}>{c.email}</a> });
  if (c.website)
    facts.push({
      label: "Website",
      value: (
        <a className="link-quiet inline-flex items-center gap-1 break-all" href={c.website} target="_blank" rel="noreferrer">
          {hostOf(c.website)} <ArrowUpRight className="size-3.5 shrink-0" />
        </a>
      ),
    });

  return (
    <article>
      <header className="border-b border-rule">
        <div className="shell pb-12 pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-2 !text-[0.625rem]">
            <Link href="/colleges" className="hover:text-ink">
              Colleges
            </Link>
            <span>/</span>
            <span className="text-ink">{c.shortName}</span>
          </nav>
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <TypeBadge type={c.type} />
              <h1 className="rise mt-4 font-display text-[2.3rem] leading-[1.04] sm:text-[3.4rem]">
                {c.name}
                {c.location && !c.name.includes(c.location) && <span className="text-muted">, {c.location}</span>}
              </h1>
              <p className="mt-3 text-[1.05rem] text-muted">
                {[c.shortName !== c.name ? c.shortName : "", c.location, c.district ? `${c.district} district` : ""].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-ink-soft">
                {faculty.length > 0
                  ? `The Department of English has ${faculty.length} ${faculty.length === 1 ? "member" : "members"} on record${heads.length ? `, headed by ${heads.map((h) => h.name).join(" and ")}` : ""}.`
                  : c.englishStatus === "vacant"
                    ? "The college lists its post in English as vacant."
                    : c.englishSeats === 0
                      ? "The college does not list English among its B.A. subjects for 2026–30."
                      : c.englishSeats
                        ? `The college admits ${c.englishSeats} students a year to B.A. English, but its English faculty have not been recorded yet.`
                        : "No English faculty have been recorded for this college yet."}
              </p>
              {c.notes && <p className="mt-3 max-w-xl text-[0.9rem] italic text-muted">{c.notes}</p>}
            </div>
            {facts.length > 0 && (
              <dl className="panel p-5">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-rule-soft py-2.5 last:border-0">
                    <dt className="shrink-0 text-[0.8rem] text-muted smallcaps">{f.label}</dt>
                    <dd className="min-w-0 text-right text-[0.92rem]">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </header>

      <section className="shell pt-12" aria-label="English faculty">
        <div className="mb-6 flex items-baseline justify-between border-b border-ink pb-3">
          <h2 className="font-display text-2xl">Department of English</h2>
          <span className="font-mono text-[0.75rem] text-muted">
            {faculty.length} {faculty.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        {faculty.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((p, i) => (
              <FacultyCard key={p.id} person={p} index={i} showCollege={false} />
            ))}
          </div>
        ) : (
          <div className="panel px-6 py-14 text-center">
            <p className="font-display text-xl">This drawer is still empty.</p>
            <p className="mx-auto mt-2 max-w-md text-[0.9rem] text-muted">
              Administrators can add this college&apos;s English faculty from the admin panel as soon as the details are available.
            </p>
          </div>
        )}
        {c.sources.length > 0 && (
          <p className="mt-10 text-[0.8rem] text-faint">
            College details from:{" "}
            {c.sources.map((s, i) => (
              <span key={i}>
                {i > 0 && "; "}
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="link-quiet">
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
              </span>
            ))}
            .
          </p>
        )}
      </section>
    </article>
  );
}
