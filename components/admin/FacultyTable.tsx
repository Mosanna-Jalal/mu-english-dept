"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, PencilLine, Search } from "lucide-react";
import { deleteFaculty } from "@/app/admin/actions";
import { Portrait } from "@/components/Portrait";
import { COLLEGE_TYPES } from "@/lib/constants";
import { catalogueNo, formatPhone } from "@/lib/format";
import type { AdminFaculty, College } from "@/lib/types";
import { DeleteDialog } from "./DeleteDialog";

type Quick = "all" | "review" | "nophoto" | "heads";
type Sort = "updated" | "name" | "college";

export function FacultyTable({ faculty, colleges }: { faculty: AdminFaculty[]; colleges: College[] }) {
  const [q, setQ] = useState("");
  const [quick, setQuick] = useState<Quick>("all");
  const [college, setCollege] = useState("");
  const [sort, setSort] = useState<Sort>("updated");
  const byId = useMemo(() => new Map(colleges.map((c) => [c.id, c])), [colleges]);

  const rows = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = faculty.filter((p) => {
      const c = byId.get(p.collegeId);
      const hay = `${p.name} ${p.designation} ${p.email} ${p.phone} ${c?.name} ${c?.shortName} ${c?.location}`.toLowerCase();
      if (!tokens.every((t) => hay.includes(t))) return false;
      if (college && p.collegeId !== college) return false;
      if (quick === "review") return p.review;
      if (quick === "nophoto") return !p.photo;
      if (quick === "heads") return p.isHead;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.sortName.localeCompare(b.sortName);
      if (sort === "college") return (byId.get(a.collegeId)?.name ?? "").localeCompare(byId.get(b.collegeId)?.name ?? "") || a.rank - b.rank;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [faculty, q, quick, college, sort, byId]);

  const quickCounts: Record<Quick, number> = {
    all: faculty.length,
    review: faculty.filter((p) => p.review).length,
    nophoto: faculty.filter((p) => !p.photo).length,
    heads: faculty.filter((p) => p.isHead).length,
  };

  return (
    <div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["review", "Needs review"],
              ["nophoto", "No photo"],
              ["heads", "Heads"],
            ] as [Quick, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" className="chip" aria-pressed={quick === k} onClick={() => setQuick(k)}>
              {label} <span className="count">{quickCounts[k]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search name, email, phone…" className="field !h-10 !pl-9 text-[0.875rem]" aria-label="Search faculty" />
          </div>
          <select value={college} onChange={(e) => setCollege(e.target.value)} className="field !h-10 text-[0.875rem] sm:w-56" aria-label="Filter by institution">
            <option value="">All institutions</option>
            {COLLEGE_TYPES.map((t) => {
              const list = colleges.filter((c) => c.type === t.value && c.facultyCount > 0);
              return list.length ? (
                <optgroup key={t.value} label={t.plural}>
                  {list.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName}
                      {c.location && c.location !== c.shortName ? `, ${c.location}` : ""}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !h-10 text-[0.875rem] sm:w-44" aria-label="Sort">
            <option value="updated">Recently edited</option>
            <option value="name">Name A–Z</option>
            <option value="college">Institution</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-rule bg-card">
        <table className="ledger min-w-[900px]">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Institution</th>
              <th>Contact</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const c = byId.get(p.collegeId);
              return (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Portrait photo={p.photo} name={p.name} sizes="44px" className="w-10 shrink-0" monogramSize="text-sm" />
                      <div className="min-w-0">
                        <Link href={`/admin/faculty/${p.id}`} className="font-display text-[1.02rem] hover:text-accent">
                          {p.name}
                        </Link>
                        <p className="text-[0.78rem] text-muted">
                          {p.designation}
                          {p.isHead ? " · Head" : ""} <span className="ml-1 font-mono text-[0.65rem] text-faint">{catalogueNo(p.serial)}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="block text-ink-soft">{c?.shortName ?? "—"}</span>
                    <span className="text-[0.75rem] text-muted">{c?.location}</span>
                  </td>
                  <td className="max-w-[230px] text-[0.8rem]">
                    <span className="block truncate text-ink-soft">{p.email || <span className="text-faint">No email</span>}</span>
                    <span className="font-mono text-[0.72rem] text-muted">{p.phone ? formatPhone(p.phone) : "—"}</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.review && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.68rem] text-accent-ink">Needs review</span>}
                      {!p.photo && <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[0.68rem] text-muted">No photo</span>}
                      {!p.review && p.photo && <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-[0.68rem] text-leaf">Complete</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/faculty/${p.slug}`} target="_blank" className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper-deep hover:text-ink" title="View on site" aria-label={`View ${p.name} on the public site`}>
                        <ExternalLink className="size-4" strokeWidth={1.75} />
                      </Link>
                      <Link href={`/admin/faculty/${p.id}`} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper-deep hover:text-ink" title="Edit" aria-label={`Edit ${p.name}`}>
                        <PencilLine className="size-4" strokeWidth={1.75} />
                      </Link>
                      <DeleteDialog
                        id={p.id}
                        action={deleteFaculty}
                        title={`Delete ${p.name}?`}
                        description={
                          <>
                            This permanently removes the record from the register
                            {p.photo ? " and deletes the photograph from Cloudinary" : ""}. This cannot be undone.
                          </>
                        }
                      >
                        <div className="flex items-center gap-3 rounded-xl border border-rule bg-paper p-3">
                          <Portrait photo={p.photo} name={p.name} sizes="56px" className="w-12 shrink-0" monogramSize="text-base" vivid />
                          <div className="min-w-0 text-left">
                            <p className="truncate font-display text-[1.05rem]">{p.name}</p>
                            <p className="truncate text-[0.78rem] text-muted">
                              {p.designation} · {c?.shortName}
                            </p>
                          </div>
                        </div>
                      </DeleteDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  No faculty match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[0.78rem] text-faint">
        Showing {rows.length} of {faculty.length}. Full phone numbers are visible only here.
      </p>
    </div>
  );
}
