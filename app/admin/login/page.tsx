import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { BodhiLeaf } from "@/components/BodhiLeaf";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="panel relative overflow-hidden px-7 pb-8 pt-10">
          <BodhiLeaf className="pointer-events-none absolute -right-10 -top-6 h-56 text-rule" />
          <div className="relative">
            <span className="grid size-12 place-items-center rounded-full border border-rule bg-paper text-accent">
              <BodhiLeaf className="h-7" filled />
            </span>
            <p className="eyebrow mt-6">The Register of English Faculty</p>
            <h1 className="mt-2 font-display text-3xl">Administration</h1>
            <p className="mt-2 text-[0.9rem] text-muted">Sign in to add, correct or remove entries.</p>
            <Suspense fallback={<div className="skeleton mt-8 h-[124px]" />}>
              <LoginBody searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-[0.85rem]">
          <Link href="/" className="link-quiet text-muted">
            ← Back to the register
          </Link>
        </p>
      </div>
    </main>
  );
}

async function LoginBody({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  if (await isAdmin()) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return <LoginForm next={next} />;
}
