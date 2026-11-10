import { getAdminRegister } from "@/lib/admin-data";
import { isAdmin } from "@/lib/auth";
import { typeLabel } from "@/lib/constants";
import { catalogueNo } from "@/lib/format";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // Quote everything and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Please sign in to the admin panel first.", { status: 401 });
  }
  const { faculty, colleges } = await getAdminRegister();
  const byId = new Map(colleges.map((c) => [c.id, c]));
  const header = [
    "Catalogue No.", "Name", "Designation", "Head of Dept", "Display order", "Additional role", "Institution", "Short name", "Category", "Location", "District",
    "Qualifications", "Areas of interest", "Profile", "Highlights & publications", "Email", "Phone", "In service since", "Appointment", "Photo URL", "Needs review", "Notes", "Sources", "Last edited",
  ];
  const lines = faculty
    .slice()
    .sort((a, b) => a.serial - b.serial)
    .map((p) => {
      const c = byId.get(p.collegeId);
      return [
        catalogueNo(p.serial), p.name, p.designation, p.isHead ? "Yes" : "", p.order ?? "", p.additionalRole, c?.name, c?.shortName, c ? typeLabel(c.type) : "", c?.location, c?.district,
        p.qualification, p.specialization.join("; "), p.bio, p.highlights.join(" | "), p.email, p.phone, p.joined, p.appointment, p.photo?.url ?? "", p.review ? "Yes" : "", p.notes,
        p.sources.map((s) => (s.url ? `${s.label} (${s.url})` : s.label)).join("; "), p.updatedAt.slice(0, 10),
      ]
        .map(cell)
        .join(",");
    });
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mu-english-faculty-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
