import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import { Portrait } from "@/components/Portrait";
import { FacultyCard } from "@/components/site/FacultyCard";
import { RecordActions } from "@/components/site/RecordActions";
import { TypeBadge } from "@/components/site/TypeBadge";
import { SHOW_FULL_PHONE_PUBLICLY, typeLabel } from "@/lib/constants";
import { getFacultyBySlug } from "@/lib/data";
import { catalogueNo, formatJoined, hostOf } from "@/lib/format";

// No generateStaticParams: entries added from the admin panel must render fully on their very
// first visit. The static shell is still prerendered; the record streams in from the cached register.

export async function generateMetadata({ params }: PageProps<"/faculty/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFacultyBySlug(slug);
  if (!data) return { title: "Not found" };
  const { person, college } = data;
  return {
    title: person.name,
    description: `${person.name}, ${person.designation}, Department of English${college ? `, ${college.name}` : ""}. Magadh University, Bodh Gaya.`,
  };
}

export default function FacultyPage({ params }: PageProps<"/faculty/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: PageProps<"/faculty/[slug]">["params"] }) {
  const { slug } = await params;
  const data = await getFacultyBySlug(slug);
  if (!data) notFound();
  const { person, college, colleagues } = data;

  const rows: { label: string; value: ReactNode }[] = [];
  if (college) {
    rows.push({
      label: "Institution",
      value: (
        <Link href={`/colleges/${college.slug}`} className="link-quiet">
          {college.name}
          {college.location && !college.name.includes(college.location) ? `, ${college.location}` : ""}
        </Link>
      ),
    });
    rows.push({ label: "Category", value: typeLabel(college.type) });
    if (college.district) rows.push({ label: "District", value: college.district });
  }
  rows.push({ label: "Department", value: "English" });
  if (person.qualification) rows.push({ label: "Qualifications", value: person.qualification });
  if (person.specialization.length) rows.push({ label: "Areas of interest", value: person.specialization.join(", ") });
  if (person.joined) rows.push({ label: "In service since", value: formatJoined(person.joined) });
  if (person.appointment) rows.push({ label: "Appointment", value: person.appointment });
  if (person.email)
    rows.push({
      label: "Email",
      value: (
        <a href={`mailto:${person.email}`} className="link-quiet break-all">
          {person.email}
        </a>
      ),
    });
  if (person.phone)
    rows.push({
      label: "Phone",
      value: (
        <span>
          <span className="font-mono text-[0.9rem] tracking-wider">{person.phone}</span>
          {!SHOW_FULL_PHONE_PUBLICLY && <span className="ml-2 text-[0.75rem] text-faint">(full number held by the administrators)</span>}
        </span>
      ),
    });

  const updated = new Date(person.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <article className="shell pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-2 !text-[0.625rem]">
        <Link href="/" className="hover:text-ink">
          Directory
        </Link>
        <span>/</span>
        {college && (
          <>
            <Link href={`/colleges/${college.slug}`} className="hover:text-ink">
              {college.shortName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink">{person.sortName}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
        <figure className="rise">
          <div className="rounded-[6px] border border-rule bg-card p-3 shadow-[var(--shadow-lg)] sm:p-4">
            <Portrait photo={person.photo} name={person.name} sizes="(min-width: 1024px) 380px, 90vw" priority vivid monogramSize="text-7xl" showAwaiting />
          </div>
          <figcaption className="mt-3 text-center font-display text-[0.9rem] italic text-muted">
            {person.photo ? `Plate — ${person.name}` : "A photograph has not yet been found for this record."}
          </figcaption>
        </figure>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[0.75rem] tracking-[0.16em] text-muted">{catalogueNo(person.serial)}</span>
            {person.isHead && <span className="stamp">Head of Department</span>}
            {college && <TypeBadge type={college.type} />}
          </div>
          <h1 className="rise mt-4 font-display text-[2.4rem] leading-[1.02] sm:text-[3.2rem]">{person.name}</h1>
          <p className="mt-3 text-[1.25rem] text-accent-ink smallcaps">{person.designation}</p>
          {person.additionalRole && <p className="mt-1 font-display text-[1.05rem] italic text-muted">{person.additionalRole}</p>}
          {college && (
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft">
              Department of English, {college.name}
              {college.location && !college.name.includes(college.location) ? `, ${college.location}` : ""}. Magadh University, Bodh Gaya.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {person.email && (
              <a href={`mailto:${person.email}`} className="btn btn-ink btn-sm">
                <Mail className="size-3.5" /> Write to {person.sortName.split(" ")[0]}
              </a>
            )}
            <RecordActions />
          </div>

          <section aria-labelledby="particulars" className="mt-10">
            <h2 id="particulars" className="eyebrow border-b border-ink pb-2">
              Particulars
            </h2>
            <dl>
              {rows.map((r) => (
                <div key={r.label} className="grid gap-1 border-b border-rule-soft py-3 sm:grid-cols-[170px_1fr] sm:gap-6">
                  <dt className="text-[0.8rem] text-muted smallcaps">{r.label}</dt>
                  <dd className="text-[0.98rem] text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {person.bio && (
            <section aria-labelledby="profile" className="mt-10">
              <h2 id="profile" className="eyebrow border-b border-ink pb-2">
                Profile
              </h2>
              <div className="mt-4 space-y-3 font-display text-[1.06rem] leading-[1.7] text-ink-soft">
                {person.bio.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {person.highlights.length > 0 && (
            <section aria-labelledby="highlights" className="mt-10">
              <h2 id="highlights" className="eyebrow border-b border-ink pb-2">
                Highlights &amp; publications
              </h2>
              <ul className="mt-2">
                {person.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 border-b border-rule-soft py-2.5 text-[0.95rem] leading-relaxed last:border-0">
                    <span aria-hidden className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="provenance" className="mt-10">
            <h2 id="provenance" className="eyebrow border-b border-ink pb-2">
              Provenance
            </h2>
            <ul className="mt-3 space-y-2 text-[0.9rem]">
              {person.sources.length === 0 && <li className="text-muted">Entered by the register&apos;s administrators.</li>}
              {person.sources.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-[0.7rem] leading-6 text-faint">{String(i + 1).padStart(2, "0")}</span>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer" className="link-quiet inline-flex items-start gap-1">
                      <span>
                        {s.label} <span className="text-faint">· {hostOf(s.url)}</span>
                      </span>
                      <ArrowUpRight className="mt-1 size-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-ink-soft">{s.label}</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.78rem] text-faint">Record last revised {updated}.</p>
          </section>
        </div>
      </div>

      {college && colleagues.length > 0 && (
        <section aria-labelledby="colleagues" className="mt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-3">
            <h2 id="colleagues" className="font-display text-2xl">
              Colleagues at {college.shortName}
            </h2>
            <Link href={`/colleges/${college.slug}`} className="text-[0.85rem] text-muted link-quiet">
              The whole department →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {colleagues.slice(0, 6).map((c, i) => (
              <FacultyCard key={c.id} person={c} college={college} index={i} showCollege={false} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function ProfileSkeleton() {
  return (
    <div className="shell pt-12" aria-hidden>
      <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
        <div className="skeleton aspect-[4/5]" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-14 w-3/4" />
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton mt-10 h-48" />
        </div>
      </div>
    </div>
  );
}
