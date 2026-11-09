"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { login, type FormState } from "@/app/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            required
            autoFocus
            autoComplete="current-password"
            className="field !pl-10 !pr-11"
            aria-invalid={state?.error ? true : undefined}
            aria-describedby={state?.error ? "login-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-paper-deep hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {state?.error && (
          <p id="login-error" role="alert" className="mt-2 text-[0.85rem] text-accent">
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className="btn btn-ink !h-11 w-full">
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
