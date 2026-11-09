"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { COLLEGE_TYPES, DESIGNATION_GROUPS, DISTRICTS, groupOfRank } from "@/lib/constants";
import { activeFilterCount, DEFAULT_FILTERS, filtersToQuery, type Filters, type GroupBy } from "@/lib/filters";
import { catalogueNo } from "@/lib/format";
import type { College, Faculty } from "@/lib/types";
import { Portrait } from "@/components/Portrait";
import { FacultyCard } from "./FacultyCard";
import { TypeBadge } from "./TypeBadge";

type Facet = "q" | "types" | "districts" | "ranks" | "college" | "heads";

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[.()]/g, "");

export function Directory({ faculty, colleges, initial }: { faculty: Faculty[]; colleges: College[]; initial: Filters }) {
  const [f, setF] = useState<Filters>(initial);
  const [panelOpen, setPanelOpen] = useState(false);
  const deferredQ = useDeferredValue(f.q);
  const searchRef = useRef<HTMLInputElement>(null);

  const collegeById = useMemo(() => new Map(colleges.map((c) => [c.id, c])), [colleges]);
  const collegeBySlug = useMemo(() => new Map(colleges.map((c) => [c.slug, c])), [colleges]);

  // Pre-compute a search haystack per person.
  const haystack = useMemo(
    () =>
      new Map(
        faculty.map((p) => {
          const c = collegeById.get(p.collegeId);
          const text = [p.name, p.designation, p.additionalRole, p.qualification, p.email, p.specialization.join(" "), c?.name, c?.shortName, c?.location, c?.district]
            .filter(Boolean)
            .join(" ");
          return [p.id, normalise(text)];
        }),
      ),
    [faculty, collegeById],
  );

  // Keep the address bar in sync so filtered views can be shared.
  useEffect(() => {
    const t = setTimeout(() => {
      const url = `${window.location.pathname}${filtersToQuery({ ...f, q: f.q.trim() })}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
    }, 250);
    return () => clearTimeout(t);
  }, [f]);

  // "/" focuses the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(el.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tests = useMemo(() => {
    const tokens = normalise(deferredQ).split(/\s+/).filter(Boolean);
    const selectedCollege = f.college ? collegeBySlug.get(f.college) : undefined;
    return {
      q: (p: Faculty) => tokens.every((t) => haystack.get(p.id)!.includes(t)),
      types: (p: Faculty) => !f.types.length || f.types.includes(collegeById.get(p.collegeId)?.type ?? "affiliated"),
      districts: (p: Faculty) => !f.districts.length || f.districts.includes(collegeById.get(p.collegeId)?.district ?? ""),
      ranks: (p: Faculty) => !f.ranks.length || f.ranks.includes(p.rank),
      college: (p: Faculty) => !selectedCollege || p.collegeId === selectedCollege.id,
      heads: (p: Faculty) => !f.heads || p.isHead,
    } satisfies Record<Facet, (p: Faculty) => boolean>;
  }, [deferredQ, f, haystack, collegeById, collegeBySlug]);

  const facets = Object.keys(tests) as Facet[];
  const passesExcept = (p: Faculty, skip: Facet | null) => facets.every((k) => k === skip || tests[k](p));

  const results = useMemo(
    () => faculty.filter((p) => (Object.keys(tests) as Facet[]).every((k) => tests[k](p))),
    [faculty, tests],
  );

  const facetCount = (skip: Facet, match: (p: Faculty) => boolean) =>
    faculty.reduce((n, p) => n + (passesExcept(p, skip) && match(p) ? 1 : 0), 0);

  const toggle = <K extends "types" | "districts" | "ranks">(key: K, value: Filters[K][number]) =>
    setF((prev) => {
      const arr = prev[key] as Array<typeof value>;
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });

  const active = activeFilterCount(f);
  const clearAll = () => setF((prev) => ({ ...DEFAULT_FILTERS, group: prev.group, view: prev.view }));

  // ------- grouping
  const sections = useMemo(() => groupResults(results, f.group, colleges), [results, f.group, colleges]);
  const signature = `${filtersToQuery({ ...f, q: deferredQ })}`;

  const facetPanel = (
    <div className="space-y-7">
      <FacetGroup title="Institution type">
        {COLLEGE_TYPES.map((t) => {
          const n = facetCount("types", (p) => collegeById.get(p.collegeId)?.type === t.value);
          if (!n && !f.types.includes(t.value)) return null;
          return (
            <Chip key={t.value} pressed={f.types.includes(t.value)} onClick={() => toggle("types", t.value)} count={n}>
              <span className={`type-badge type-${t.value} !text-[0px] !tracking-normal`} aria-hidden />
              {t.plural}
            </Chip>
          );
        })}
      </FacetGroup>
      <FacetGroup title="District">
        {DISTRICTS.map((d) => {
          const n = facetCount("districts", (p) => collegeById.get(p.collegeId)?.district === d);
          return (
            <Chip key={d} pressed={f.districts.includes(d)} onClick={() => toggle("districts", d)} count={n}>
              {d}
            </Chip>
          );
        })}
      </FacetGroup>
      <FacetGroup title="Designation">
        {DESIGNATION_GROUPS.map((g, i) => {
          const rank = i + 1;
          const n = facetCount("ranks", (p) => p.rank === rank);
          if (!n && !f.ranks.includes(rank)) return null;
          return (
            <Chip key={g} pressed={f.ranks.includes(rank)} onClick={() => toggle("ranks", rank)} count={n}>
              {g}
            </Chip>
          );
        })}
        <Chip pressed={f.heads} onClick={() => setF((p) => ({ ...p, heads: !p.heads }))} count={facetCount("heads", (p) => p.isHead)}>
          Heads of Department
        </Chip>
      </FacetGroup>
      <div>
        <label htmlFor="college-filter" className="eyebrow mb-3 block">
          College
        </label>
        <select
          id="college-filter"
          className="field !h-10 text-[0.875rem]"
          value={f.college}
          onChange={(e) => setF((p) => ({ ...p, college: e.target.value }))}
        >
          <option value="">All institutions</option>
          {COLLEGE_TYPES.map((t) => {
            const list = colleges.filter((c) => c.type === t.value && c.facultyCount > 0);
            if (!list.length) return null;
            return (
              <optgroup key={t.value} label={t.plural}>
                {list.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.shortName}
                    {c.location && c.location !== c.shortName ? `, ${c.location}` : ""} ({c.facultyCount})
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>
    </div>
  );

  return (
    <section id="directory" className="shell scroll-mt-28 pt-6" aria-label="Faculty directory">
      {/* search + controls */}
      <div className="relative z-30 -mx-2 rounded-2xl px-2 py-3 md:sticky md:top-[6.25rem] md:backdrop-blur-md md:supports-[backdrop-filter]:bg-paper/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[1.1rem] -translate-y-1/2 text-muted" strokeWidth={1.75} />
            <input
              ref={searchRef}
              type="search"
              value={f.q}
              onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))}
              placeholder="Search names, colleges, subjects…"
              aria-label="Search the register"
              className="field !h-12 !rounded-full !pl-11 !pr-12 text-[0.95rem] shadow-[var(--shadow-sm)]"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-rule px-1.5 font-mono text-[0.65rem] text-faint sm:block">
              /
            </kbd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn lg:hidden" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}>
              <SlidersHorizontal className="size-4" strokeWidth={1.75} />
              Refine{active ? ` · ${active}` : ""}
            </button>
            <Segmented
              label="Group by"
              value={f.group}
              options={[
                { value: "college", label: "College" },
                { value: "designation", label: "Rank" },
                { value: "none", label: "A–Z" },
              ]}
              onChange={(v) => setF((p) => ({ ...p, group: v as GroupBy }))}
            />
            <div className="flex rounded-full border border-rule bg-card p-0.5" role="group" aria-label="View">
              <IconToggle pressed={f.view === "cards"} onClick={() => setF((p) => ({ ...p, view: "cards" }))} label="Card view">
                <LayoutGrid className="size-4" strokeWidth={1.75} />
              </IconToggle>
              <IconToggle pressed={f.view === "ledger"} onClick={() => setF((p) => ({ ...p, view: "ledger" }))} label="Ledger view">
                <Rows3 className="size-4" strokeWidth={1.75} />
              </IconToggle>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[250px_1fr]">
        {/* facets */}
        <aside className={`${panelOpen ? "block" : "hidden"} lg:block`}>
          <div className="panel p-5 lg:sticky lg:top-[11.5rem] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg">Index</p>
              {active > 0 && (
                <button type="button" onClick={clearAll} className="text-[0.8rem] text-accent link-quiet">
                  Clear all
                </button>
              )}
            </div>
            {facetPanel}
          </div>
        </aside>

        {/* results */}
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-3">
            <p className="text-[0.9rem] text-muted" aria-live="polite">
              Showing <span className="font-display text-xl text-ink oldstyle">{results.length}</span> of {faculty.length} faculty
              {sections.length > 1 && f.group === "college" ? ` in ${sections.length} institutions` : ""}
            </p>
            <ActiveTags f={f} setF={setF} collegeBySlug={collegeBySlug} />
          </div>

          {results.length === 0 ? (
            <div className="panel grid place-items-center px-6 py-16 text-center">
              <p className="font-display text-2xl">No entry matches that search.</p>
              <p className="mt-2 max-w-sm text-[0.9rem] text-muted">Try fewer filters or a shorter search. Spellings of Indian names vary, so a first or last name alone often works best.</p>
              <button type="button" className="btn btn-ink mt-6" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            <div key={signature} className="space-y-14">
              {sections.map((s, si) => (
                <section key={s.key} aria-label={s.title}>
                  {s.title && <SectionHeader section={s} index={si} />}
                  {f.view === "cards" ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {s.items.map((p, i) => (
                        <FacultyCard key={p.id} person={p} college={collegeById.get(p.collegeId)} index={i} showCollege={f.group !== "college"} />
                      ))}
                    </div>
                  ) : (
                    <Ledger items={s.items} collegeById={collegeById} showCollege={f.group !== "college"} />
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ helpers

interface Section {
  key: string;
  title: string;
  college?: College;
  subtitle?: string;
  items: Faculty[];
}

function groupResults(results: Faculty[], group: GroupBy, colleges: College[]): Section[] {
  if (group === "college") {
    const map = new Map<string, Faculty[]>();
    for (const p of results) map.set(p.collegeId, [...(map.get(p.collegeId) ?? []), p]);
    return colleges
      .filter((c) => map.has(c.id))
      .map((c) => ({ key: c.id, title: c.name, college: c, items: map.get(c.id)! }));
  }
  if (group === "designation") {
    return DESIGNATION_GROUPS.map((g, i) => ({
      key: g,
      title: i === 4 ? "Guest & other faculty" : `${g}s`,
      items: results.filter((p) => p.rank === i + 1).sort((a, b) => a.sortName.localeCompare(b.sortName)),
    })).filter((s) => s.items.length);
  }
  const sorted = [...results].sort((a, b) => a.sortName.localeCompare(b.sortName));
  const letters = new Map<string, Faculty[]>();
  for (const p of sorted) {
    const l = p.sortName[0]?.toUpperCase() ?? "#";
    letters.set(l, [...(letters.get(l) ?? []), p]);
  }
  return [...letters.entries()].map(([l, items]) => ({ key: l, title: l, items, subtitle: "letter" }));
}

function SectionHeader({ section, index }: { section: Section; index: number }) {
  const c = section.college;
  if (section.subtitle === "letter") {
    return (
      <div className="mb-5 flex items-center gap-4">
        <span className="font-display text-4xl italic text-accent" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
          {section.title}
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>
    );
  }
  if (!c) {
    return (
      <div className="mb-5 flex items-baseline gap-4 border-b border-rule pb-3">
        <h3 className="font-display text-2xl">{section.title}</h3>
        <span className="font-mono text-xs text-muted">{section.items.length}</span>
      </div>
    );
  }
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
      <div>
        <span className="drawer-label">
          Drawer {String(index + 1).padStart(2, "0")} · {c.district || "—"}
        </span>
        <h3 className="mt-3 font-display text-[1.6rem] leading-tight sm:text-[1.85rem]">
          {c.name}
          {c.location && !c.name.includes(c.location) && <span className="text-muted">, {c.location}</span>}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <TypeBadge type={c.type} />
          {c.shortName !== c.name && <span className="text-[0.8rem] text-muted">{c.shortName}</span>}
          <span className="font-mono text-[0.7rem] text-faint">
            {section.items.length} {section.items.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>
      <Link href={`/colleges/${c.slug}`} className="group inline-flex items-center gap-1.5 text-[0.85rem] text-muted transition-colors hover:text-accent">
        College page <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </header>
  );
}

function Ledger({ items, collegeById, showCollege }: { items: Faculty[]; collegeById: Map<string, College>; showCollege: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-rule bg-card">
      <table className="ledger min-w-[640px]">
        <thead>
          <tr>
            <th className="w-[92px]">No.</th>
            <th>Name</th>
            <th>Designation</th>
            {showCollege && <th>Institution</th>}
            <th className="hidden md:table-cell">Contact</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => {
            const c = collegeById.get(p.collegeId);
            return (
              <tr key={p.id} className="rise" style={{ "--i": i } as CSSProperties}>
                <td className="font-mono text-[0.7rem] text-muted">{catalogueNo(p.serial)}</td>
                <td>
                  <Link href={`/faculty/${p.slug}`} className="group flex items-center gap-3">
                    <Portrait photo={p.photo} name={p.name} sizes="40px" className="w-9 shrink-0" monogramSize="text-sm" />
                    <span className="font-display text-[1.02rem] group-hover:text-accent">{p.name}</span>
                    {p.isHead && <span className="stamp !text-[0.55rem]">Head</span>}
                  </Link>
                </td>
                <td className="text-ink-soft">{p.designation}</td>
                {showCollege && (
                  <td>
                    <span className="block text-ink-soft">{c?.shortName}</span>
                    <span className="text-[0.75rem] text-muted">{c?.district}</span>
                  </td>
                )}
                <td className="hidden max-w-[220px] truncate text-[0.8rem] text-muted md:table-cell">
                  {p.email ? (
                    <a className="link-quiet" href={`mailto:${p.email}`}>
                      {p.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ pressed, onClick, count, children }: { pressed: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick} disabled={!count && !pressed}>
      {children}
      <span className="count">{count}</span>
    </button>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center rounded-full border border-rule bg-card p-0.5" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-9 whitespace-nowrap rounded-full px-2.5 text-[0.8rem] transition-all duration-200 sm:px-3 ${
            value === o.value ? "bg-ink text-paper shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function IconToggle({ pressed, onClick, label, children }: { pressed: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-full transition-all duration-200 ${pressed ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function ActiveTags({ f, setF, collegeBySlug }: { f: Filters; setF: React.Dispatch<React.SetStateAction<Filters>>; collegeBySlug: Map<string, College> }) {
  const tags: { label: string; remove: () => void }[] = [];
  f.types.forEach((t) => tags.push({ label: COLLEGE_TYPES.find((x) => x.value === t)?.plural ?? t, remove: () => setF((p) => ({ ...p, types: p.types.filter((x) => x !== t) })) }));
  f.districts.forEach((d) => tags.push({ label: d, remove: () => setF((p) => ({ ...p, districts: p.districts.filter((x) => x !== d) })) }));
  f.ranks.forEach((r) => tags.push({ label: groupOfRank(r), remove: () => setF((p) => ({ ...p, ranks: p.ranks.filter((x) => x !== r) })) }));
  if (f.college) tags.push({ label: collegeBySlug.get(f.college)?.shortName ?? f.college, remove: () => setF((p) => ({ ...p, college: "" })) });
  if (f.heads) tags.push({ label: "Heads only", remove: () => setF((p) => ({ ...p, heads: false })) });
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <button
          key={t.label}
          type="button"
          onClick={t.remove}
          className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[0.75rem] text-accent-ink transition-opacity hover:opacity-80"
        >
          {t.label}
          <X className="size-3" />
        </button>
      ))}
    </div>
  );
}
