// Uncached reads for the admin panel: always fresh, never shared between users.
import { ObjectId } from "mongodb";
import { collections } from "./db";
import { sortColleges, toAdminFaculty, toCollege } from "./data";

export async function getAdminRegister() {
  const { faculty, colleges } = await collections();
  const [collegeDocs, facultyDocs] = await Promise.all([colleges.find().toArray(), faculty.find().toArray()]);
  const counts = new Map<string, number>();
  for (const f of facultyDocs) counts.set(f.collegeId.toHexString(), (counts.get(f.collegeId.toHexString()) ?? 0) + 1);
  return {
    colleges: sortColleges(collegeDocs.map((c) => toCollege(c, counts.get(c._id.toHexString()) ?? 0))),
    faculty: facultyDocs.map(toAdminFaculty).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };
}

export async function getAdminFaculty(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const { faculty } = await collections();
  const doc = await faculty.findOne({ _id: new ObjectId(id) });
  return doc ? toAdminFaculty(doc) : null;
}

export async function getAdminCollege(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const { colleges, faculty } = await collections();
  const doc = await colleges.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  const count = await faculty.countDocuments({ collegeId: doc._id });
  return toCollege(doc, count);
}
