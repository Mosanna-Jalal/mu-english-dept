"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Download, ExternalLink, LogOut, NotebookPen, UserPlus, Users } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { BodhiLeaf } from "@/components/BodhiLeaf";

const LINKS = [
  { href: "/admin", label: "Faculty", icon: Users, match: (p: string) => p === "/admin" || (p.startsWith("/admin/faculty/") && !p.endsWith("/new")) },
  { href: "/admin/faculty/new", label: "Add faculty", icon: UserPlus, match: (p: string) => p === "/admin/faculty/new" },
  { href: "/admin/colleges", label: "Colleges", icon: Building2, match: (p: string) => p.startsWith("/admin/colleges") && !p.endsWith("/new") },
  { href: "/admin/colleges/new", label: "Add college", icon: NotebookPen, match: (p: string) => p === "/admin/colleges/new" },
];

export function AdminNav() {
  return <AdminNavView pathname={usePathname()} />;
}

/** Pure view, also used as the static fallback while the pathname is unknown. */
export function AdminNavView({ pathname }: { pathname: string }) {
  return (
    <aside className="border-b border-rule bg-card/70 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-ink text-gold">
              <BodhiLeaf className="h-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[1.02rem]">The Register</span>
              <span className="eyebrow !text-[0.55rem]">Administration</span>
            </span>
          </Link>
        </div>
        <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.875rem] transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {l.label}
              </Link>
            );
          })}
          <a href="/admin/export" className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.875rem] text-ink-soft transition-colors hover:bg-paper-deep">
            <Download className="size-4" strokeWidth={1.75} />
            Export CSV
          </a>
          <form action={logout} className="shrink-0 lg:hidden">
            <button type="submit" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.875rem] text-ink-soft transition-colors hover:bg-paper-deep">
              <LogOut className="size-4" strokeWidth={1.75} /> Sign out
            </button>
          </form>
        </nav>
        <div className="mt-auto hidden flex-col gap-1 border-t border-rule pt-4 lg:flex">
          <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.85rem] text-muted hover:bg-paper-deep hover:text-ink">
            <ExternalLink className="size-4" strokeWidth={1.75} /> View public site
          </Link>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.85rem] text-muted hover:bg-paper-deep hover:text-ink">
              <LogOut className="size-4" strokeWidth={1.75} /> Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
