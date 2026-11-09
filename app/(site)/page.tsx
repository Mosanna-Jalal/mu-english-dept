import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BodhiLeaf } from "@/components/BodhiLeaf";
import { Almanac } from "@/components/site/Almanac";
import { Directory } from "@/components/site/Directory";
import { DISTRICTS } from "@/lib/constants";
import { getRegister } from "@/lib/data";
import { parseFilters } from "@/lib/filters";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Hero />
      <Suspense fallback={<DirectorySkeleton />}>
        <DirectorySection searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Hero() {
  const { faculty, colleges, updatedAt } = await getRegister();
  const withFaculty = colleges.filter((c) => c.facultyCount > 0);
  const byDistrict = DISTRICTS.map((d) => ({
    district: d,
    count: faculty.filter((p) => withFaculty.find((c) => c.id === p.collegeId)?.district === d).length,
  }));
  const dateline = new Date(updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <section className="relative overflow-hidden border-b border-rule">
      <BodhiLeaf
        animate
        className="pointer-events-none absolute -right-24 -top-6 h-[560px] text-rule opacity-80 sm:-right-10 lg:right-[-2rem] lg:h-[680px]"
      />
      <div className="shell relative pb-14 pt-14 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow rise">Vol. I &nbsp;·&nbsp; Department of English &nbsp;·&nbsp; Magadh University</p>
            <h1
              className="rise mt-6 font-display text-[2.9rem] font-normal leading-[0.98] tracking-[-0.025em] sm:text-[4.1rem] lg:text-[5.1rem]"
              style={{ "--i": 1 } as CSSProperties}
            >
              Every teacher
              <br />
              of{" "}
              <em className="text-accent" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
                English,
              </em>
              <br />
              on one register.
            </h1>
            <p className="rise mt-7 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft" style={{ "--i": 2 } as CSSProperties}>
              The English faculty of the University Department and of the constituent, minority, government and affiliated colleges of Magadh University. Compiled from official records and from the
              faculty themselves, with photographs wherever they could be found.
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ "--i": 3 } as CSSProperties}>
              <a href="#directory" className="btn btn-ink !h-11 !px-5">
                Open the directory <ArrowDown className="size-4" />
              </a>
              <Link href="/colleges" className="btn !h-11 !px-5">
                Browse by college <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <Almanac
            title="The register in figures"
            dateline={`Updated ${dateline}`}
            rows={[
              { value: faculty.length, label: "Faculty on record" },
              { value: withFaculty.length, label: "Institutions represented" },
              { value: faculty.filter((p) => p.rank <= 2).length, label: "Professors & Associate Professors" },
              { value: faculty.filter((p) => p.isHead).length, label: "Heads of Department" },
              { value: faculty.filter((p) => p.photo).length, label: "Portraits on file" },
            ]}
          />
        </div>

        <nav aria-label="Browse by district" className="mt-14 border-y border-rule">
          <ul className="grid grid-cols-2 sm:grid-cols-5">
            {byDistrict.map((d, i) => (
              <li key={d.district} className={`border-rule ${i > 0 ? "sm:border-l" : ""} ${i % 2 === 1 ? "border-l sm:border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""}`}>
                <Link
                  href={`/?district=${d.district}#directory`}
                  className="group flex items-baseline justify-between gap-2 px-3 py-4 transition-colors hover:bg-card sm:px-4"
                >
                  <span className="font-display text-[1.15rem] transition-colors group-hover:text-accent">{d.district}</span>
                  <span className="font-mono text-[0.7rem] text-muted">{String(d.count).padStart(2, "0")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

async function DirectorySection({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const [sp, { faculty, colleges }] = await Promise.all([searchParams, getRegister()]);
  return <Directory faculty={faculty} colleges={colleges} initial={parseFilters(sp)} />;
}

function DirectorySkeleton() {
  return (
    <div className="shell pt-9" aria-hidden>
      <div className="skeleton h-12 w-full !rounded-full" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-8" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-[214px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
