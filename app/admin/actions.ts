"use server";

import { ObjectId, type Collection } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { destroyPortrait, uploadPortrait } from "@/lib/cloudinary";
import { designationRank } from "@/lib/constants";
import { REGISTER_TAG } from "@/lib/data";
import { collections, type CollegeDoc, type FacultyDoc } from "@/lib/db";
import { plainName, slugify } from "@/lib/format";
import { createSessionToken, passwordMatches, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import type { Photo } from "@/lib/types";
import { collegeSchema, facultySchema, fieldErrors, linesFrom, sourcesFrom, str, type FieldErrors } from "@/lib/validation";

export type FormState = { error?: string; fieldErrors?: FieldErrors } | null;

const SESSION_EXPIRED: FormState = { error: "Your session has expired. Please sign in again in a new tab, then save." };
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const notice = (text: string) => `/admin?notice=${encodeURIComponent(text)}`;

function safeNext(next: string) {
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

// ------------------------------------------------------------------- session

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!passwordMatches(str(fd, "password"))) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return { error: "That password is not correct." };
  }
  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(safeNext(str(fd, "next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ------------------------------------------------------------------- faculty

async function uniqueSlug<T extends { slug: string }>(col: Collection<T>, base: string, fallback: string) {
  const root = slugify(base) || fallback;
  let slug = root;
  for (let i = 2; await col.findOne({ slug } as never); i++) slug = `${root}-${i}`;
  return slug;
}

export async function saveFaculty(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return SESSION_EXPIRED;

  const parsed = facultySchema.safeParse({
    name: str(fd, "name"),
    designation: str(fd, "designation"),
    order: str(fd, "order").trim(),
    isHead: fd.get("isHead") === "on",
    additionalRole: str(fd, "additionalRole"),
    collegeId: str(fd, "collegeId"),
    qualification: str(fd, "qualification"),
    specialization: str(fd, "specialization")
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean),
    email: str(fd, "email").trim(),
    phone: str(fd, "phone"),
    joined: str(fd, "joined"),
    appointment: str(fd, "appointment"),
    bio: str(fd, "bio"),
    highlights: linesFrom(str(fd, "highlights")),
    sources: sourcesFrom(fd),
    notes: str(fd, "notes"),
    review: fd.get("review") === "on",
  });
  if (!parsed.success) return { error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;

  const { faculty, colleges } = await collections();
  const college = await colleges.findOne({ _id: new ObjectId(data.collegeId) });
  if (!college) return { fieldErrors: { collegeId: "That institution no longer exists." } };

  const id = str(fd, "id");
  const existing = id && ObjectId.isValid(id) ? await faculty.findOne({ _id: new ObjectId(id) }) : null;
  if (id && !existing) return { error: "This record no longer exists. It may have been deleted in another tab." };
  const slug = existing?.slug ?? (await uniqueSlug(faculty, data.name, "faculty"));

  // Photo: upload first, swap the record over, then retire the old image.
  const file = fd.get("photo");
  let photo: Photo | null = existing?.photo ?? null;
  let uploaded: Photo | null = null;
  let retire: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { fieldErrors: { photo: "Choose an image file (JPEG, PNG or WebP)." } };
    if (file.size > 3.5 * 1024 * 1024) return { fieldErrors: { photo: "That image is too large. Please choose one under 3.5 MB." } };
    try {
      uploaded = await uploadPortrait(Buffer.from(await file.arrayBuffer()), slug);
    } catch (e) {
      return { error: `The photo could not be uploaded to Cloudinary: ${message(e)}` };
    }
    retire = existing?.photo?.publicId ?? null;
    photo = uploaded;
  } else if (fd.get("removePhoto") === "1" && existing?.photo) {
    retire = existing.photo.publicId;
    photo = null;
  }

  const now = new Date();
  const doc = {
    name: data.name,
    sortName: plainName(data.name),
    designation: data.designation,
    rank: designationRank(data.designation),
    order: data.order === "" ? null : data.order,
    isHead: data.isHead,
    additionalRole: data.additionalRole,
    collegeId: college._id,
    qualification: data.qualification,
    specialization: data.specialization,
    email: data.email,
    phone: data.phone,
    joined: data.joined,
    appointment: data.appointment,
    bio: data.bio,
    highlights: data.highlights,
    photo,
    sources: data.sources,
    notes: data.notes,
    review: data.review,
    updatedAt: now,
  } satisfies Partial<FacultyDoc>;

  try {
    if (existing) {
      await faculty.updateOne({ _id: existing._id }, { $set: doc });
    } else {
      const last = await faculty.find().sort({ serial: -1 }).limit(1).next();
      await faculty.insertOne({ _id: new ObjectId(), slug, serial: (last?.serial ?? 0) + 1, createdAt: now, ...doc });
    }
  } catch (e) {
    if (uploaded) await destroyPortrait(uploaded.publicId).catch(() => {});
    return { error: `The record could not be saved: ${message(e)}` };
  }

  if (retire) {
    try {
      await destroyPortrait(retire);
    } catch (e) {
      console.error(`Old portrait ${retire} could not be removed from Cloudinary:`, e);
    }
  }

  updateTag(REGISTER_TAG);
  redirect(notice(existing ? `Saved changes to ${data.name}.` : `Added ${data.name} to the register.`));
}

export async function deleteFaculty(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return SESSION_EXPIRED;
  const id = str(fd, "id");
  if (!ObjectId.isValid(id)) return { error: "Unknown record." };
  const { faculty } = await collections();
  const doc = await faculty.findOne({ _id: new ObjectId(id) });
  if (!doc) return { error: "This record has already been deleted." };

  // Remove the photo from Cloudinary first; keep the record if that fails, so nothing is orphaned.
  if (doc.photo?.publicId) {
    try {
      await destroyPortrait(doc.photo.publicId);
    } catch (e) {
      return { error: `The photo could not be deleted from Cloudinary, so the record was kept. Please try again. (${message(e)})` };
    }
  }
  await faculty.deleteOne({ _id: doc._id });
  updateTag(REGISTER_TAG);
  redirect(notice(`Deleted ${doc.name} and their photo.`));
}

// ------------------------------------------------------------------ colleges

export async function saveCollege(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return SESSION_EXPIRED;
  const parsed = collegeSchema.safeParse({
    name: str(fd, "name"),
    shortName: str(fd, "shortName"),
    type: str(fd, "type"),
    location: str(fd, "location"),
    district: str(fd, "district"),
    website: str(fd, "website"),
    principal: str(fd, "principal"),
    principalTitle: str(fd, "principalTitle"),
    phone: str(fd, "phone"),
    email: str(fd, "email").trim(),
    collegeCode: str(fd, "collegeCode"),
    established: str(fd, "established").trim(),
    englishStatus: str(fd, "englishStatus") || "unknown",
    englishSeats: str(fd, "englishSeats").trim(),
    notes: str(fd, "notes"),
  });
  if (!parsed.success) return { error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const { colleges } = await collections();
  const id = str(fd, "id");
  const existing = id && ObjectId.isValid(id) ? await colleges.findOne({ _id: new ObjectId(id) }) : null;
  if (id && !existing) return { error: "This college no longer exists." };

  const now = new Date();
  const doc = {
    name: d.name,
    shortName: d.shortName || d.name,
    type: d.type,
    location: d.location,
    district: d.district,
    website: d.website,
    principal: d.principal,
    principalTitle: d.principalTitle || "Principal",
    phone: d.phone,
    email: d.email,
    collegeCode: d.collegeCode,
    established: d.established === "" ? null : d.established,
    englishStatus: d.englishStatus,
    englishSeats: d.englishSeats === "" ? null : d.englishSeats,
    notes: d.notes,
    updatedAt: now,
  } satisfies Partial<CollegeDoc>;

  try {
    if (existing) {
      await colleges.updateOne({ _id: existing._id }, { $set: doc });
    } else {
      const slug = await uniqueSlug(colleges, `${d.shortName || d.name} ${d.location}`, "college");
      await colleges.insertOne({ _id: new ObjectId(), slug, sources: [], createdAt: now, ...doc });
    }
  } catch (e) {
    return { error: `The college could not be saved: ${message(e)}` };
  }
  updateTag(REGISTER_TAG);
  redirect(`/admin/colleges?notice=${encodeURIComponent(existing ? `Saved ${d.name}.` : `Added ${d.name}.`)}`);
}

export async function deleteCollege(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return SESSION_EXPIRED;
  const id = str(fd, "id");
  if (!ObjectId.isValid(id)) return { error: "Unknown college." };
  const { colleges, faculty } = await collections();
  const doc = await colleges.findOne({ _id: new ObjectId(id) });
  if (!doc) return { error: "This college has already been deleted." };
  const count = await faculty.countDocuments({ collegeId: doc._id });
  if (count > 0) {
    return { error: `${doc.name} still has ${count} faculty ${count === 1 ? "record" : "records"}. Move or delete them first.` };
  }
  await colleges.deleteOne({ _id: doc._id });
  updateTag(REGISTER_TAG);
  redirect(`/admin/colleges?notice=${encodeURIComponent(`Deleted ${doc.name}.`)}`);
}
