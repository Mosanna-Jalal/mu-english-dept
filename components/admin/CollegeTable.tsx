"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PencilLine, Search, UserPlus } from "lucide-react";
import { deleteCollege } from "@/app/admin/actions";
import { TypeBadge } from "@/components/site/TypeBadge";
import { COLLEGE_TYPES } from "@/lib/constants";
import type { College, CollegeType } from "@/lib/types";
import { DeleteDialog } from "./DeleteDialog";

export function CollegeTable({ colleges }: { colleges: College[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<CollegeType | "">("");
  const rows = useMemo(() => {
    const t = q.toLowerCase().trim();
    return colleges.filter(
      (c) => (!type || c.type === type) && (!t || `${c.name} ${c.shortName} ${c.location} ${c.district} ${c.principal}`.toLowerCase().includes(t)),
    );
  }, [colleges, q, type]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={type === ""} onClick={() => setType("")}>
            All <span className="count">{colleges.length}</span>
          </button>
          {COLLEGE_TYPES.map((t) => (
            <button key={t.value} type="button" className="chip" aria-pressed={type === t.value} onClick={() => setType(t.value)}>
              {t.plural} <span className="count">{colleges.filter((c) => c.type === t.value).length}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search colleges…" className="field !h-10 !pl-9 text-[0.875rem]" aria-label="Search colleges" />
        </div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-rule bg-card">
        <table className="ledger min-w-[820px]">
          <thead>
            <tr>
              <th>Institution</th>
              <th>Category</th>
              <th>District</th>
              <th className="text-right">Faculty</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/colleges/${c.id}`} className="font-display text-[1rem] hover:text-accent">
                    {c.name}
                  </Link>
                  <span className="block text-[0.75rem] text-muted">
                    {c.shortName !== c.name ? `${c.shortName} · ` : ""}
                    {c.location}
                  </span>
                </td>
                <td>
                  <TypeBadge type={c.type} />
                </td>
                <td className="text-muted">{c.district || "—"}</td>
                <td className="text-right font-mono text-[0.85rem]">{c.facultyCount || <span className="text-faint">0</span>}</td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/faculty/new?college=${c.id}`} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper-deep hover:text-ink" title="Add faculty here" aria-label={`Add faculty to ${c.name}`}>
                      <UserPlus className="size-4" strokeWidth={1.75} />
                    </Link>
                    <Link href={`/admin/colleges/${c.id}`} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper-deep hover:text-ink" title="Edit" aria-label={`Edit ${c.name}`}>
                      <PencilLine className="size-4" strokeWidth={1.75} />
                    </Link>
                    <DeleteDialog
                      id={c.id}
                      action={deleteCollege}
                      title={`Delete ${c.name}?`}
                      description={
                        c.facultyCount > 0 ? (
                          <>
                            This college still has <strong>{c.facultyCount}</strong> faculty {c.facultyCount === 1 ? "record" : "records"}. Move or delete them first.
                          </>
                        ) : (
                          "This permanently removes the college from the register. This cannot be undone."
                        )
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  No colleges match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
