import { Suspense } from "react";
import type { Metadata } from "next";
import { FacultyForm } from "@/components/admin/FacultyForm";
import { AdminSkeleton, PageHeader } from "@/components/admin/PageHeader";
import { getAdminRegister } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Add faculty" };

export default function NewFacultyPage({ searchParams }: PageProps<"/admin/faculty/new">) {
  return (
    <>
      <PageHeader eyebrow="Faculty · new entry" title="Add a faculty member" />
      <Suspense fallback={<AdminSkeleton />}>
        <NewForm searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewForm({ searchParams }: { searchParams: PageProps<"/admin/faculty/new">["searchParams"] }) {
  await requireAdminPage();
  const [{ colleges }, sp] = await Promise.all([getAdminRegister(), searchParams]);
  const college = typeof sp.college === "string" ? sp.college : "";
  return <FacultyForm colleges={colleges} defaultCollegeId={colleges.some((c) => c.id === college) ? college : ""} />;
}
