"use client";

import { useState } from "react";
import { Check, Link2, Printer } from "lucide-react";

export function RecordActions() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="no-print flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm" onClick={copy}>
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button type="button" className="btn btn-sm" onClick={() => window.print()}>
        <Printer className="size-3.5" /> Print record
      </button>
    </div>
  );
}
