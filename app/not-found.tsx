import Link from "next/link";
import { BodhiLeaf } from "@/components/BodhiLeaf";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-20 text-center">
      <div>
        <BodhiLeaf className="mx-auto h-28 text-accent" animate />
        <p className="eyebrow mt-8">Error 404 · card not found</p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-tight sm:text-5xl">This card is missing from the drawer.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">The page may have moved, or the entry may have been removed from the register.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-ink">
            Back to the directory
          </Link>
          <Link href="/colleges" className="btn">
            Browse colleges
          </Link>
        </div>
      </div>
    </main>
  );
}
