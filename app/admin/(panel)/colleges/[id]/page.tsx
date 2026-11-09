import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ExternalLink, UserPlus } from "lucide-react";
import { deleteCollege } from "@/app/admin/actions";
import { CollegeForm } from "@/components/admin/CollegeForm";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { AdminSkeleton, PageHeader } from "@/components/admin/PageHeader";
import { getAdminCollege } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit college" };

export default function EditCollegePage({ params }: PageProps<"/admin/colleges/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/colleges/[id]">["params"] }) {
  await requireAdminPage();
  const { id } = await params;
  const college = await getAdminCollege(id);
  if (!college) notFound();
  return (
    <>
      <PageHeader eyebrow={`${college.facultyCount} faculty on record`} title={college.name}>
        <Link href={`/admin/faculty/new?college=${college.id}`} className="btn">
          <UserPlus className="size-4" strokeWidth={1.75} /> Add faculty
        </Link>
        <Link href={`/colleges/${college.slug}`} target="_blank" className="btn">
          <ExternalLink className="size-4" strokeWidth={1.75} /> View
        </Link>
        <DeleteDialog
          id={college.id}
          action={deleteCollege}
          trigger="button"
          title={`Delete ${college.name}?`}
          description={
            college.facultyCount > 0
              ? `This college still has ${college.facultyCount} faculty ${college.facultyCount === 1 ? "record" : "records"}. Move or delete them first.`
              : "This permanently removes the college from the register. This cannot be undone."
          }
        />
      </PageHeader>
      <CollegeForm key={college.id} initial={college} />
    </>
  );
}
