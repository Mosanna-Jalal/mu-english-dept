"use client";

import Link from "next/link";
import { useActionState, useState, useTransition, type ReactNode } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";
import { saveFaculty, type FormState } from "@/app/admin/actions";
import { APPOINTMENTS, COLLEGE_TYPES, DESIGNATIONS } from "@/lib/constants";
import type { AdminFaculty, College } from "@/lib/types";
import { PhotoField } from "./PhotoField";

export function FacultyForm({ initial, colleges, defaultCollegeId = "" }: { initial?: AdminFaculty; colleges: College[]; defaultCollegeId?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveFaculty, null);
  const [, startTransition] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [sources, setSources] = useState(() =>
    (initial?.sources.length ? initial.sources : [{ label: "", url: "" }]).map((s, i) => ({ ...s, key: `s${i}` })),
  );
  const err = (k: string) => state?.fieldErrors?.[k];

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Submitting manually (instead of <form action>) keeps the fields filled in if validation fails.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="grid gap-10 lg:grid-cols-[300px_1fr]"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <PhotoField current={initial?.photo ?? null} name={name} error={err("photo")} />
        <div className="panel space-y-3 p-4">
          <Check name="isHead" label="Head of Department" hint="Shows the HEAD stamp on the card." defaultChecked={initial?.isHead} />
          <Check name="review" label="Needs review" hint="Admin-only flag for details still to be confirmed." defaultChecked={initial?.review} />
        </div>
      </div>

      <div className="min-w-0 space-y-10">
        {state?.error && (
          <p role="alert" className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-[0.9rem] text-accent-ink">
            {state.error}
          </p>
        )}

        <Fieldset title="Identity">
          <Field label="Full name, with title" error={err("name")} className="sm:col-span-2">
            <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Dr. Firstname Lastname" aria-invalid={!!err("name")} required />
          </Field>
          <Field label="Designation" error={err("designation")}>
            <input name="designation" list="designations" defaultValue={initial?.designation ?? "Assistant Professor"} className="field" aria-invalid={!!err("designation")} required />
            <datalist id="designations">
              {DESIGNATIONS.map((d) => (
                <option key={d.value} value={d.value} />
              ))}
            </datalist>
          </Field>
          <Field label="Additional role" hint="Optional, e.g. Dean, Faculty of Humanities" error={err("additionalRole")}>
            <input name="additionalRole" defaultValue={initial?.additionalRole} className="field" />
          </Field>
        </Fieldset>

        <Fieldset title="Institution">
          <Field label="College or department" error={err("collegeId")} className="sm:col-span-2">
            <select name="collegeId" defaultValue={initial?.collegeId ?? defaultCollegeId} className="field" aria-invalid={!!err("collegeId")} required>
              <option value="">Choose an institution…</option>
              {COLLEGE_TYPES.map((t) => {
                const list = colleges.filter((c) => c.type === t.value);
                return list.length ? (
                  <optgroup key={t.value} label={t.plural}>
                    {list.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.location && !c.name.includes(c.location) ? `, ${c.location}` : ""}
                      </option>
                    ))}
                  </optgroup>
                ) : null;
              })}
            </select>
          </Field>
          <Field label="Display order" hint="Position within the college: 1 = first. Blank = automatic" error={err("order")}>
            <input name="order" defaultValue={initial?.order ?? ""} className="field" inputMode="numeric" placeholder="Automatic" aria-invalid={!!err("order")} />
          </Field>
          <Field label="In service since" hint="YYYY, YYYY-MM or YYYY-MM-DD" error={err("joined")}>
            <input name="joined" defaultValue={initial?.joined} className="field" placeholder="2025-08-07" inputMode="numeric" aria-invalid={!!err("joined")} />
          </Field>
          <Field label="Appointment" error={err("appointment")}>
            <select name="appointment" defaultValue={initial?.appointment ?? ""} className="field">
              <option value="">Not stated</option>
              {APPOINTMENTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
        </Fieldset>

        <Fieldset title="Academic">
          <Field label="Qualifications" error={err("qualification")} className="sm:col-span-2">
            <input name="qualification" defaultValue={initial?.qualification} className="field" placeholder="M.A., Ph.D., UGC-NET" />
          </Field>
          <Field label="Areas of interest" hint="Separate with commas" error={err("specialization")} className="sm:col-span-2">
            <input name="specialization" defaultValue={initial?.specialization.join(", ")} className="field" placeholder="Indian Writing in English, ELT, Translation Studies" />
          </Field>
        </Fieldset>

        <Fieldset title="Profile & highlights" description="Shown on the public record. Leave blank if nothing is known yet.">
          <Field label="Profile" hint="A short paragraph about their teaching and work" error={err("bio")} className="sm:col-span-2">
            <textarea name="bio" rows={4} defaultValue={initial?.bio} className="field" placeholder="Teaching for over 15 years; previously taught at …" />
          </Field>
          <Field label="Highlights & publications" hint="One per line" error={err("highlights")} className="sm:col-span-2">
            <textarea
              name="highlights"
              rows={5}
              defaultValue={initial?.highlights.join("\n")}
              className="field font-mono text-[0.85rem]"
              placeholder={"Supervised 2 awarded Ph.D.s\nFulbright Fellow, Brown University (2011–12)\n“Title of article”, Journal Name (2024)"}
            />
          </Field>
        </Fieldset>

        <Fieldset title="Contact">
          <Field label="Email" error={err("email")}>
            <input name="email" type="email" defaultValue={initial?.email} className="field" placeholder="name@college.ac.in" aria-invalid={!!err("email")} />
          </Field>
          <Field label="Phone" hint="Masked on the public site" error={err("phone")}>
            <input name="phone" type="tel" defaultValue={initial?.phone} className="field" placeholder="98765 43210" aria-invalid={!!err("phone")} />
          </Field>
        </Fieldset>

        <Fieldset title="Sources" description="Where these details came from. Links appear under “Provenance” on the public record.">
          <div className="space-y-2 sm:col-span-2">
            {sources.map((s, i) => (
              <div key={s.key} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input name="sourceLabel" defaultValue={s.label} className="field" placeholder="e.g. College website — staff page" aria-label={`Source ${i + 1} description`} />
                <input name="sourceUrl" defaultValue={s.url} className="field" placeholder="https://…" aria-label={`Source ${i + 1} link`} aria-invalid={!!err(`sources.${i}.url`)} />
                <button
                  type="button"
                  className="btn btn-ghost !px-3"
                  onClick={() => setSources((list) => list.filter((x) => x.key !== s.key))}
                  aria-label={`Remove source ${i + 1}`}
                  disabled={sources.length === 1}
                >
                  <X className="size-4" />
                </button>
                {err(`sources.${i}.url`) && <p className="text-[0.8rem] text-accent sm:col-span-3">{err(`sources.${i}.url`)}</p>}
              </div>
            ))}
            {sources.length < 10 && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSources((list) => [...list, { label: "", url: "", key: `n${Date.now()}` }])}>
                <Plus className="size-3.5" /> Add source
              </button>
            )}
          </div>
        </Fieldset>

        <Fieldset title="Internal notes" description="Only administrators see these.">
          <Field label="Notes" error={err("notes")} className="sm:col-span-2">
            <textarea name="notes" rows={4} defaultValue={initial?.notes} className="field" placeholder="Anything to verify or follow up…" />
          </Field>
        </Fieldset>

        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-2xl border border-rule bg-card/90 p-3 shadow-[var(--shadow-lg)] backdrop-blur">
          <Link href="/admin" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-ink min-w-36" disabled={pending}>
            {pending && <LoaderCircle className="size-4 animate-spin" />}
            {pending ? "Saving…" : initial ? "Save changes" : "Add to register"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Fieldset({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="w-full border-b border-rule pb-2">
        <span className="font-display text-xl">{title}</span>
        {description && <span className="mt-0.5 block text-[0.8rem] text-muted">{description}</span>}
      </legend>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, hint, error, className = "", children }: { label: string; hint?: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">
        {label}
        {hint && <span className="ml-2 font-normal text-faint">{hint}</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-[0.8rem] text-accent">
          {error}
        </span>
      )}
    </label>
  );
}

function Check({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-[var(--accent)]" />
      <span>
        <span className="block text-[0.9rem] font-medium">{label}</span>
        <span className="block text-[0.78rem] text-muted">{hint}</span>
      </span>
    </label>
  );
}
