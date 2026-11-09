"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Directory", match: (p: string) => p === "/" || p.startsWith("/faculty") },
  { href: "/colleges", label: "Colleges", match: (p: string) => p.startsWith("/colleges") },
  { href: "/about", label: "About the Register", short: "About", match: (p: string) => p.startsWith("/about") },
];

export function NavLinks() {
  return <NavLinksView pathname={usePathname()} />;
}

/** Pure view, also used as the static fallback while the pathname is unknown. */
export function NavLinksView({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-full px-3 py-1.5 text-[0.875rem] transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {l.short ? (
              <>
                <span className="hidden md:inline">{l.label}</span>
                <span className="md:hidden">{l.short}</span>
              </>
            ) : (
              l.label
            )}
            <span
              className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
