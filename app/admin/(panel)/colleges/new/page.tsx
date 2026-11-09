import { Suspense } from "react";
import type { Metadata } from "next";
import { CollegeForm } from "@/components/admin/CollegeForm";
import { AdminSkeleton, PageHeader } from "@/components/admin/PageHeader";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Add college" };

export default function NewCollegePage() {
  return (
    <>
      <PageHeader eyebrow="Colleges · new entry" title="Add a college or department" />
      <Suspense fallback={<AdminSkeleton />}>
        <Gate />
      </Suspense>
    </>
  );
}

async function Gate() {
  await requireAdminPage();
  return <CollegeForm />;
}
