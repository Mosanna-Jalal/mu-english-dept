"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

/** A small toast for "saved / deleted" confirmations passed via ?notice=… */
export function Notice({ text }: { text: string }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    // Drop ?notice from the address bar so a refresh doesn't repeat it.
    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    const t = setTimeout(() => setOpen(false), 5000);
    return () => clearTimeout(t);
  }, [text]);
  if (!open || !text) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 flex w-[min(92vw,440px)] -translate-x-1/2 items-start gap-3 rounded-xl border border-rule bg-ink px-4 py-3 text-[0.9rem] text-paper shadow-[var(--shadow-lg)]"
      style={{ animation: "toast-in .35s cubic-bezier(.2,.7,.2,1)" }}
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
      <p className="flex-1">{text}</p>
      <button type="button" onClick={() => setOpen(false)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
}
