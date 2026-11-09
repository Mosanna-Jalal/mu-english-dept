import Link from "next/link";
import { Suspense } from "react";
import { Download, UserPlus } from "lucide-react";
import { FacultyTable } from "@/components/admin/FacultyTable";
import { Notice } from "@/components/admin/Notice";
import { AdminSkeleton, PageHeader } from "@/components/admin/PageHeader";
import { getAdminRegister } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default function AdminHome({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Faculty register">
        <a href="/admin/export" className="btn">
          <Download className="size-4" strokeWidth={1.75} /> Export CSV
        </a>
        <Link href="/admin/faculty/new" className="btn btn-ink">
          <UserPlus className="size-4" strokeWidth={1.75} /> Add faculty
        </Link>
      </PageHeader>
      <Suspense fallback={<AdminSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  await requireAdminPage();
  const [{ faculty, colleges }, sp] = await Promise.all([getAdminRegister(), searchParams]);
  const notice = typeof sp.notice === "string" ? sp.notice : "";
  const represented = colleges.filter((c) => c.facultyCount > 0).length;
  const stats = [
    { label: "Faculty on record", value: faculty.length },
    { label: "Institutions represented", value: `${represented}/${colleges.length}` },
    { label: "With photograph", value: faculty.filter((p) => p.photo).length },
    { label: "Missing photograph", value: faculty.filter((p) => !p.photo).length },
    { label: "Flagged for review", value: faculty.filter((p) => p.review).length },
  ];
  return (
    <>
      {notice && <Notice text={notice} />}
      <dl className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="panel px-4 py-4">
            <dt className="text-[0.75rem] text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-[2rem] leading-none">{s.value}</dd>
          </div>
        ))}
      </dl>
      <FacultyTable faculty={faculty} colleges={colleges} />
    </>
  );
}
