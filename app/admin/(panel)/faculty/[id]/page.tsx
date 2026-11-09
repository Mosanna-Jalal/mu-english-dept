import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { deleteFaculty } from "@/app/admin/actions";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { FacultyForm } from "@/components/admin/FacultyForm";
import { AdminSkeleton, PageHeader } from "@/components/admin/PageHeader";
import { getAdminFaculty, getAdminRegister } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";
import { catalogueNo } from "@/lib/format";

export const metadata: Metadata = { title: "Edit faculty" };

export default function EditFacultyPage({ params }: PageProps<"/admin/faculty/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/faculty/[id]">["params"] }) {
  await requireAdminPage();
  const { id } = await params;
  const [person, { colleges }] = await Promise.all([getAdminFaculty(id), getAdminRegister()]);
  if (!person) notFound();
  const updated = new Date(person.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

  return (
    <>
      <PageHeader eyebrow={`${catalogueNo(person.serial)} · last edited ${updated}`} title={person.name}>
        <Link href={`/faculty/${person.slug}`} target="_blank" className="btn">
          <ExternalLink className="size-4" strokeWidth={1.75} /> View on site
        </Link>
        <DeleteDialog
          id={person.id}
          action={deleteFaculty}
          trigger="button"
          title={`Delete ${person.name}?`}
          description={
            <>
              This permanently removes the record from the register
              {person.photo ? " and deletes the photograph from Cloudinary" : ""}. This cannot be undone.
            </>
          }
        />
      </PageHeader>
      <FacultyForm key={person.updatedAt} initial={person} colleges={colleges} />
    </>
  );
}
