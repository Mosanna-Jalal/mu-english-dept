import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { BodhiLeaf } from "@/components/BodhiLeaf";
import { DEVELOPER, SITE } from "@/lib/constants";

// On phones the link buttons sit in a 4-column grid with 40px tap targets;
// from `sm` up they flow inline as compact pills.
const linkBtn = "btn h-10 px-2 text-[0.8125rem] sm:h-8 sm:px-3";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-rule bg-paper-deep/60 md:mt-24">
      <div className="shell">
        <div className="grid gap-9 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 md:py-14">
          <div>
            <div className="flex items-center gap-3">
              <BodhiLeaf className="h-9 shrink-0 text-accent" filled />
              <p className="font-display text-xl">
                The Register <span className="italic text-muted">of</span> English Faculty
              </p>
            </div>
            <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-muted">{SITE.description}</p>
          </div>
          {/* Two columns side by side on phones; separate grid columns from md up. */}
          <div className="grid grid-cols-2 gap-6 md:contents">
            <div>
              <p className="eyebrow">The Register</p>
              <ul className="mt-4 space-y-2.5 text-[0.9rem] md:space-y-2">
                <li><Link className="link-quiet" href="/">Directory of faculty</Link></li>
                <li><Link className="link-quiet" href="/colleges">Colleges &amp; institutions</Link></li>
                <li><Link className="link-quiet" href="/about">Method, sources &amp; coverage</Link></li>
                <li><Link className="link-quiet" href="/admin">Administration</Link></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow">Primary sources</p>
              <ul className="mt-4 space-y-2.5 text-[0.9rem] md:space-y-2">
                <li>
                  <a className="link-quiet inline-flex items-center gap-1" href="https://magadhuniversity.ac.in" target="_blank" rel="noreferrer">
                    Magadh University <ArrowUpRight className="size-3.5 shrink-0" />
                  </a>
                </li>
                <li className="text-muted">Official college websites</li>
                <li className="text-muted">Submissions from faculty members</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Developer credit */}
        <div className="rule-double grid gap-6 py-8 md:grid-cols-[auto_1fr_auto] md:items-center">
          <a href={DEVELOPER.portfolio} target="_blank" rel="noreferrer" className="group flex items-center gap-4" aria-label="Developer's portfolio">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-full border border-ink bg-ink font-display text-base tracking-[0.12em] text-paper transition-transform duration-500 group-hover:rotate-[-8deg] sm:size-14 sm:text-lg"
              style={{ fontVariationSettings: '"SOFT" 0, "WONK" 0' }}
            >
              {DEVELOPER.monogram}
            </span>
            <span className="min-w-0">
              <span className="eyebrow block !text-[0.5625rem]">Designed &amp; developed by</span>
              <span className="mt-1 block font-display text-[1.2rem] leading-tight transition-colors group-hover:text-accent sm:text-[1.35rem]">
                {DEVELOPER.role}
              </span>
              <span className="mt-1 block text-[0.8rem] text-muted">{DEVELOPER.place}</span>
            </span>
          </a>
          <p className="max-w-md text-[0.84rem] leading-relaxed text-muted md:justify-self-center md:text-center">
            Builds web products with React, Next.js and Node, and works with AI APIs. Has been writing code for about a decade.
          </p>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:items-center md:justify-end">
            <a className={`${linkBtn} btn-ink col-span-3`} href={DEVELOPER.portfolio} target="_blank" rel="noreferrer">
              Portfolio <ArrowUpRight className="size-3.5" />
            </a>
            <a className={linkBtn} href={`mailto:${DEVELOPER.email}`} aria-label="Email the developer" title="Email">
              <Mail className="size-4 sm:size-3.5" />
            </a>
            {DEVELOPER.links.map((l) => (
              <a key={l.label} className={linkBtn} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-rule pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-center text-[0.72rem] text-faint sm:flex-row sm:items-center sm:justify-between sm:text-left sm:text-[0.75rem]">
          <p>Set in Fraunces, Schibsted Grotesk &amp; JetBrains Mono. Built with Next.js, MongoDB &amp; Cloudinary.</p>
          <p className="font-mono tracking-wider">Compiled 2026 · Gaya, Bihar</p>
        </div>
      </div>
    </footer>
  );
}
