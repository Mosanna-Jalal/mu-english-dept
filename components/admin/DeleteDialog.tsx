"use client";

import { useActionState, useRef, type ReactNode } from "react";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import type { FormState } from "@/app/admin/actions";

/**
 * A confirmation dialog wrapping a delete Server Action. Nothing is deleted
 * until the person confirms inside the dialog.
 */
export function DeleteDialog({
  id,
  action,
  title,
  description,
  children,
  trigger = "icon",
  confirmLabel = "Delete permanently",
}: {
  id: string;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  title: string;
  description: ReactNode;
  children?: ReactNode;
  trigger?: "icon" | "button";
  confirmLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);

  return (
    <>
      {trigger === "icon" ? (
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-accent"
          aria-label={title}
          title="Delete"
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
        </button>
      ) : (
        <button type="button" onClick={() => ref.current?.showModal()} className="btn border-accent/40 text-accent hover:!border-accent">
          <Trash2 className="size-4" strokeWidth={1.75} /> Delete…
        </button>
      )}

      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,460px)] rounded-2xl border border-rule bg-card p-0 text-ink shadow-[var(--shadow-lg)]"
        aria-labelledby={`del-title-${id}`}
        onClick={(e) => {
          if (e.target === ref.current && !pending) ref.current.close();
        }}
      >
        <form action={formAction} className="p-6">
          <input type="hidden" name="id" value={id} />
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <AlertTriangle className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 id={`del-title-${id}`} className="font-display text-xl leading-tight">
                {title}
              </h2>
              <div className="mt-2 text-[0.9rem] leading-relaxed text-muted">{description}</div>
            </div>
          </div>
          {children && <div className="mt-5">{children}</div>}
          {state?.error && (
            <p role="alert" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-[0.85rem] text-accent-ink">
              {state.error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => ref.current?.close()} disabled={pending} autoFocus>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={pending}>
              {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {pending ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
