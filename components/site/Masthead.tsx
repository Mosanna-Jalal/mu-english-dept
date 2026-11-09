import Link from "next/link";
import { Suspense } from "react";
import { BodhiLeaf } from "@/components/BodhiLeaf";
import { NavLinks, NavLinksView } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <div className="border-b border-rule-soft">
        <div className="shell flex h-8 items-center justify-between eyebrow !text-[0.625rem]">
          <span>Magadh University · Bodh Gaya, Bihar</span>
          <span className="hidden md:inline">Department of English · across all colleges</span>
          <ThemeToggle className="-mr-2 text-muted" />
        </div>
      </div>
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3" aria-label="The Register of English Faculty, home">
          <span className="grid size-10 place-items-center rounded-full border border-rule bg-card text-accent transition-transform duration-500 group-hover:-rotate-12">
            <BodhiLeaf className="h-6" filled />
          </span>
          <span className="hidden leading-none min-[480px]:block">
            <span className="block font-display text-[1.05rem] font-medium tracking-tight sm:text-[1.15rem]">
              The Register <span className="italic text-muted">of</span> English Faculty
            </span>
            <span className="mt-1 hidden eyebrow !text-[0.5625rem] sm:block">Magadh University · Est. 1962</span>
          </span>
        </Link>
        <Suspense fallback={<NavLinksView pathname="" />}>
          <NavLinks />
        </Suspense>
      </div>
    </header>
  );
}
