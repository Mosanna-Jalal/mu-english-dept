"use client";

import Link from "next/link";
import { useActionState, useTransition, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { saveCollege, type FormState } from "@/app/admin/actions";
import { COLLEGE_TYPES, DISTRICTS } from "@/lib/constants";
import type { College } from "@/lib/types";

export function CollegeForm({ initial }: { initial?: College }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveCollege, null);
  const [, startTransition] = useTransition();
  const err = (k: string) => state?.fieldErrors?.[k];

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="max-w-4xl space-y-10"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {state?.error && (
        <p role="alert" className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-[0.9rem] text-accent-ink">
          {state.error}
        </p>
      )}

      <Section title="Institution">
        <Field label="Full name" error={err("name")} className="sm:col-span-2">
          <input name="name" defaultValue={initial?.name} className="field" placeholder="Gautam Buddha Mahila College" aria-invalid={!!err("name")} required />
        </Field>
        <Field label="Short name" hint="As commonly written" error={err("shortName")}>
          <input name="shortName" defaultValue={initial?.shortName} className="field" placeholder="G.B.M. College" />
        </Field>
        <Field label="Category" error={err("type")}>
          <select name="type" defaultValue={initial?.type ?? "affiliated"} className="field" aria-invalid={!!err("type")}>
            {COLLEGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Town / location" error={err("location")}>
          <input name="location" defaultValue={initial?.location} className="field" placeholder="Gaya" />
        </Field>
        <Field label="District" error={err("district")}>
          <input name="district" list="districts" defaultValue={initial?.district} className="field" placeholder="Gaya" />
          <datalist id="districts">
            {DISTRICTS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </Field>
        <Field label="Established" hint="Year" error={err("established")}>
          <input name="established" defaultValue={initial?.established ?? ""} className="field" inputMode="numeric" placeholder="1972" aria-invalid={!!err("established")} />
        </Field>
        <Field label="College code" error={err("collegeCode")}>
          <input name="collegeCode" defaultValue={initial?.collegeCode} className="field" />
        </Field>
      </Section>

      <Section title="Contact">
        <Field label="Principal / head" error={err("principal")}>
          <input name="principal" defaultValue={initial?.principal} className="field" placeholder="Dr. …" />
        </Field>
        <Field label="Title" error={err("principalTitle")}>
          <input name="principalTitle" defaultValue={initial?.principalTitle ?? "Principal"} className="field" />
        </Field>
        <Field label="Office phone" error={err("phone")}>
          <input name="phone" defaultValue={initial?.phone} className="field" />
        </Field>
        <Field label="Email" error={err("email")}>
          <input name="email" type="email" defaultValue={initial?.email} className="field" aria-invalid={!!err("email")} />
        </Field>
        <Field label="Website" error={err("website")} className="sm:col-span-2">
          <input name="website" defaultValue={initial?.website} className="field" placeholder="https://…" aria-invalid={!!err("website")} />
        </Field>
      </Section>

      <Section title="Department of English">
        <Field label="Status" error={err("englishStatus")}>
          <select name="englishStatus" defaultValue={initial?.englishStatus ?? "unknown"} className="field">
            <option value="active">Faculty in post</option>
            <option value="vacant">Post vacant</option>
            <option value="unknown">Not yet known</option>
          </select>
        </Field>
        <Field label="B.A. English seats" hint="2026–30 intake; 0 if not offered" error={err("englishSeats")}>
          <input name="englishSeats" defaultValue={initial?.englishSeats ?? ""} className="field" inputMode="numeric" placeholder="48" aria-invalid={!!err("englishSeats")} />
        </Field>
        <Field label="Public note" hint="Shown on the college page" error={err("notes")} className="sm:col-span-2">
          <textarea name="notes" rows={3} defaultValue={initial?.notes} className="field" />
        </Field>
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-2xl border border-rule bg-card/90 p-3 shadow-[var(--shadow-lg)] backdrop-blur">
        <Link href="/admin/colleges" className="btn btn-ghost">
          Cancel
        </Link>
        <button type="submit" className="btn btn-ink min-w-36" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {pending ? "Saving…" : initial ? "Save changes" : "Add college"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="w-full border-b border-rule pb-2 font-display text-xl">{title}</legend>
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
