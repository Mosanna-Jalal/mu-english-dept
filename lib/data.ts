import { cacheLife, cacheTag } from "next/cache";
import { collections, type CollegeDoc, type FacultyDoc } from "./db";
import { COLLEGE_TYPES, SHOW_FULL_PHONE_PUBLICLY } from "./constants";
import { formatPhone, maskPhone } from "./format";
import type { AdminFaculty, College, Faculty, Register } from "./types";

export const REGISTER_TAG = "register";

const typeOrder = (t: string) => COLLEGE_TYPES.findIndex((x) => x.value === t);

export function sortColleges<T extends Pick<College, "type" | "name">>(list: T[]): T[] {
  return [...list].sort((a, b) => typeOrder(a.type) - typeOrder(b.type) || a.name.localeCompare(b.name));
}

export function toCollege(doc: CollegeDoc, facultyCount = 0): College {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    name: doc.name,
    shortName: doc.shortName || doc.name,
    type: doc.type,
    location: doc.location ?? "",
    district: doc.district ?? "",
    website: doc.website ?? "",
    principal: doc.principal ?? "",
    principalTitle: doc.principalTitle || "Principal",
    phone: doc.phone ?? "",
    email: doc.email ?? "",
    collegeCode: doc.collegeCode ?? "",
    established: doc.established ?? null,
    englishStatus: doc.englishStatus ?? "unknown",
    englishSeats: typeof doc.englishSeats === "number" ? doc.englishSeats : null,
    notes: doc.notes ?? "",
    sources: doc.sources ?? [],
    facultyCount,
  };
}

export function toAdminFaculty(doc: FacultyDoc): AdminFaculty {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    serial: doc.serial ?? 0,
    name: doc.name,
    sortName: doc.sortName,
    designation: doc.designation,
    rank: doc.rank ?? 5,
    order: typeof doc.order === "number" ? doc.order : null,
    isHead: !!doc.isHead,
    additionalRole: doc.additionalRole ?? "",
    collegeId: doc.collegeId.toHexString(),
    qualification: doc.qualification ?? "",
    specialization: doc.specialization ?? [],
    email: doc.email ?? "",
    phone: doc.phone ?? "",
    joined: doc.joined ?? "",
    appointment: doc.appointment ?? "",
    bio: doc.bio ?? "",
    highlights: doc.highlights ?? [],
    photo: doc.photo
      ? { publicId: doc.photo.publicId, version: doc.photo.version, width: doc.photo.width, height: doc.photo.height, url: doc.photo.url }
      : null,
    sources: (doc.sources ?? []).map((s) => ({ label: s.label, url: s.url ?? "" })),
    notes: doc.notes ?? "",
    review: !!doc.review,
    createdAt: (doc.createdAt ?? new Date(0)).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date(0)).toISOString(),
  };
}

/** Strips internal fields and masks personal phone numbers for the public site. */
function toPublicFaculty(doc: FacultyDoc): Faculty {
  const full = toAdminFaculty(doc);
  return {
    id: full.id,
    slug: full.slug,
    serial: full.serial,
    name: full.name,
    sortName: full.sortName,
    designation: full.designation,
    rank: full.rank,
    order: full.order,
    isHead: full.isHead,
    additionalRole: full.additionalRole,
    collegeId: full.collegeId,
    qualification: full.qualification,
    specialization: full.specialization,
    email: full.email,
    phone: full.phone ? (SHOW_FULL_PHONE_PUBLICLY ? formatPhone(full.phone) : maskPhone(full.phone)) : "",
    joined: full.joined,
    appointment: full.appointment,
    bio: full.bio,
    highlights: full.highlights,
    photo: full.photo,
    sources: full.sources,
    updatedAt: full.updatedAt,
  };
}

/**
 * Everything the public site needs, read once and cached. Admin edits call
 * updateTag(REGISTER_TAG), so changes appear immediately; direct database edits
 * show up within the hour.
 */
export async function getRegister(): Promise<Register> {
  "use cache";
  cacheLife("hours");
  cacheTag(REGISTER_TAG);

  const { faculty, colleges } = await collections();
  const [collegeDocs, facultyDocs] = await Promise.all([colleges.find().toArray(), faculty.find().toArray()]);

  const counts = new Map<string, number>();
  for (const f of facultyDocs) {
    const key = f.collegeId.toHexString();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const collegeList = sortColleges(collegeDocs.map((c) => toCollege(c, counts.get(c._id.toHexString()) ?? 0)));
  const order = new Map(collegeList.map((c, i) => [c.id, i]));
  const facultyList = facultyDocs
    .map(toPublicFaculty)
    .sort(
      (a, b) =>
        (order.get(a.collegeId) ?? 999) - (order.get(b.collegeId) ?? 999) ||
        (a.order ?? 1000) - (b.order ?? 1000) ||
        Number(b.isHead) - Number(a.isHead) ||
        a.rank - b.rank ||
        a.sortName.localeCompare(b.sortName),
    );

  const latest = facultyDocs.reduce((m, f) => Math.max(m, f.updatedAt?.getTime?.() ?? 0), 0);
  return { colleges: collegeList, faculty: facultyList, updatedAt: new Date(latest || 0).toISOString() };
}

export async function getFacultyBySlug(slug: string) {
  const register = await getRegister();
  const person = register.faculty.find((f) => f.slug === slug);
  if (!person) return null;
  const college = register.colleges.find((c) => c.id === person.collegeId) ?? null;
  const colleagues = register.faculty.filter((f) => f.collegeId === person.collegeId && f.id !== person.id);
  return { person, college, colleagues };
}

export async function getCollegeBySlug(slug: string) {
  const register = await getRegister();
  const college = register.colleges.find((c) => c.slug === slug);
  if (!college) return null;
  return { college, faculty: register.faculty.filter((f) => f.collegeId === college.id) };
}
