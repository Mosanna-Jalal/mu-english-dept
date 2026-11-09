import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { CollegeTable } from "@/components/admin/CollegeTable";
import { Notice } from "@/components/admin/Notice";
import { AdminSkeleton, PageHeader } from "@/components/admin/PageHeader";
import { getAdminRegister } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Colleges" };

export default function AdminCollegesPage({ searchParams }: PageProps<"/admin/colleges">) {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Colleges & institutions">
        <Link href="/admin/colleges/new" className="btn btn-ink">
          <Plus className="size-4" /> Add college
        </Link>
      </PageHeader>
      <Suspense fallback={<AdminSkeleton />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: { searchParams: PageProps<"/admin/colleges">["searchParams"] }) {
  await requireAdminPage();
  const [{ colleges }, sp] = await Promise.all([getAdminRegister(), searchParams]);
  const notice = typeof sp.notice === "string" ? sp.notice : "";
  return (
    <>
      {notice && <Notice text={notice} />}
      <CollegeTable colleges={colleges} />
    </>
  );
}
