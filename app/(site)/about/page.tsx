import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { TypeBadge } from "@/components/site/TypeBadge";
import { DESIGNATION_GROUPS, DISTRICTS } from "@/lib/constants";
import { getRegister } from "@/lib/data";

export const metadata: Metadata = {
  title: "About the Register",
  description: "How the Register of English Faculty was compiled: its sources, its coverage and how corrections are made.",
};

const STEPS = [
  {
    title: "The University's own lists",
    body: "Colleges, principals and the P.G. Department of English come from Magadh University's official website. The University's 2026–30 admissions system adds every college that admits B.A. students, including the new Government Degree Colleges, and shows which of them teach English.",
  },
  {
    title: "Each college, one by one",
    body: "We visited every college website that could be reached and read its Department of English, teaching-staff and faculty-profile pages and published CVs. Each entry links back to the page it came from.",
  },
  {
    title: "Archives and research directories",
    body: "Where a college website is down or closed to automated reading, its pages were read from copies kept by the Internet Archive. Qualifications and research records were checked against the University's IRINS research portal.",
  },
  {
    title: "The faculty themselves",
    body: "Where a college publishes nothing, the register relies on details that faculty members sent in themselves, with their designation, institution and photograph.",
  },
  {
    title: "Photographs",
    body: "Portraits are taken from college and university pages or from the faculty submissions. Where no photograph could be found anywhere, an engraved monogram stands in until one is added.",
  },
];

export default async function AboutPage() {
  const { colleges, faculty } = await getRegister();
  const core = colleges.filter((c) => c.type !== "affiliated");
  const affiliatedWithData = colleges.filter((c) => c.type === "affiliated" && c.facultyCount > 0).length;
  const withFaculty = new Map(colleges.map((c) => [c.id, c]));
  const district = DISTRICTS.map((d) => ({ label: d, n: faculty.filter((p) => withFaculty.get(p.collegeId)?.district === d).length }));
  const ranks = DESIGNATION_GROUPS.map((g, i) => ({ label: g, n: faculty.filter((p) => p.rank === i + 1).length }));
  const max = Math.max(1, ...district.map((d) => d.n), ...ranks.map((r) => r.n));

  return (
    <>
      <section className="border-b border-rule">
        <div className="shell grid gap-12 pb-14 pt-14 md:pt-20 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow rise">About the Register</p>
            <h1 className="rise mt-5 font-display text-[2.6rem] leading-[1.02] sm:text-[3.6rem]" style={{ "--i": 1 } as CSSProperties}>
              A working record, <em className="text-accent">kept up to date.</em>
            </h1>
            <p className="rise mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft" style={{ "--i": 2 } as CSSProperties}>
              This register brings together, in one place, everyone who teaches English under Magadh University, Bodh Gaya. It was compiled in 2026 from public records and from the faculty
              themselves. It is meant to be corrected and added to as appointments change.
            </p>
          </div>
          <div className="panel self-end p-6 text-[0.9rem] leading-relaxed text-ink-soft">
            <p className="font-display text-lg italic text-ink">On privacy</p>
            <p className="mt-2">
              Official email addresses are shown openly. Personal mobile numbers are partly masked on the public site, and only the register&apos;s administrators can see them in full.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pt-16">
        <h2 className="eyebrow border-b border-ink pb-2">Method</h2>
        <ol className="mt-2 grid gap-x-12 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-5 border-b border-rule-soft py-6">
              <span className="font-display text-4xl italic leading-none text-accent" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
                {["i", "ii", "iii", "iv", "v"][i]}.
              </span>
              <div>
                <h3 className="font-display text-xl">{s.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="shell grid gap-12 pt-16 lg:grid-cols-2">
        <Bars title="By district" rows={district} max={max} />
        <Bars title="By designation" rows={ranks} max={max} />
      </section>

      <section className="shell pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-2">
          <h2 className="eyebrow">Coverage</h2>
          <p className="text-[0.8rem] text-muted">
            {core.filter((c) => c.facultyCount > 0).length} of {core.length} main institutions have entries · {affiliatedWithData} of{" "}
            {colleges.length - core.length} affiliated colleges
          </p>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-rule bg-card">
          <table className="ledger min-w-[640px]">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Category</th>
                <th className="text-right">Entries</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {core.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/colleges/${c.slug}`} className="font-display text-[1rem] hover:text-accent">
                      {c.name}
                    </Link>
                    <span className="text-muted">{c.location && !c.name.includes(c.location) ? `, ${c.location}` : ""}</span>
                  </td>
                  <td>
                    <TypeBadge type={c.type} />
                  </td>
                  <td className="text-right font-mono">{c.facultyCount || "—"}</td>
                  <td className="text-[0.82rem] text-muted">
                    {c.facultyCount > 0 ? (
                      <span className="text-leaf">Recorded</span>
                    ) : c.englishStatus === "vacant" ? (
                      "Post shown as vacant"
                    ) : (
                      c.notes || "Not yet found"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
          Spotted an error, a transfer or a new appointment? Administrators can correct, add or remove any entry from the{" "}
          <Link href="/admin" className="link-quiet text-ink">
            admin panel
          </Link>
          , and the change appears on the site immediately.
        </p>
      </section>
    </>
  );
}

function Bars({ title, rows, max }: { title: string; rows: { label: string; n: number }[]; max: number }) {
  return (
    <div>
      <h2 className="eyebrow border-b border-ink pb-2">{title}</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[minmax(0,190px)_1fr_auto] items-center gap-4">
            <span className="truncate text-[0.9rem] text-ink-soft">{r.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
              <span className="block h-full rounded-full bg-accent/80" style={{ width: `${(r.n / max) * 100}%` }} />
            </span>
            <span className="w-8 text-right font-mono text-[0.8rem] text-muted">{r.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
