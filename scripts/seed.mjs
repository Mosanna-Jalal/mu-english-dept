// Seeds MongoDB + Cloudinary from data/seed/{colleges,faculty}.json and data/seed/photos/.
// Idempotent: records are upserted by slug, and existing photos are kept unless --photos is passed.
// Records edited in the admin panel since they were last seeded are left untouched (use --force
// to overwrite them anyway). Colleges marked "retired" are removed if no faculty belong to them.
//
//   node scripts/seed.mjs            # insert / update records, upload missing photos
//   node scripts/seed.mjs --photos   # also re-upload every photo
//   node scripts/seed.mjs --force    # also overwrite records edited in the admin panel
import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { plainName } from "../lib/format.ts";
import { designationRank } from "../lib/constants.ts";

const root = path.resolve(import.meta.dirname, "..");
const seedDir = path.join(root, "data", "seed");
const forcePhotos = process.argv.includes("--photos");
const force = process.argv.includes("--force");
// Edited in the admin panel after the last seed? (Admin saves bump updatedAt past seededAt.)
const editedByAdmin = (doc) => !force && doc && doc.seededAt && doc.updatedAt > new Date(doc.seededAt.getTime() + 2000);

// Minimal .env.local reader (no extra dependency).
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { DB_URI, DB_NAME = "english_faculty_database", CLOUDINARY_FOLDER = "mu-english/faculty" } = process.env;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const colleges = JSON.parse(fs.readFileSync(path.join(seedDir, "colleges.json"), "utf8"));
const faculty = JSON.parse(fs.readFileSync(path.join(seedDir, "faculty.json"), "utf8"));

const client = await new MongoClient(DB_URI).connect();
const db = client.db(DB_NAME);
const Colleges = db.collection("colleges");
const Faculty = db.collection("faculty");

await Colleges.createIndex({ slug: 1 }, { unique: true });
await Faculty.createIndex({ slug: 1 }, { unique: true });
await Faculty.createIndex({ collegeId: 1 });
await Faculty.createIndex({ serial: 1 });

const now = new Date();
const collegeIds = new Map();
let keptColleges = 0, retired = 0;
for (const c of colleges) {
  const { slug, retired: isRetired, ...rest } = c;
  const existing = await Colleges.findOne({ slug });
  if (isRetired) {
    if (existing && !(await Faculty.countDocuments({ collegeId: existing._id }))) {
      await Colleges.deleteOne({ _id: existing._id });
      retired++;
    }
    continue;
  }
  if (editedByAdmin(existing)) {
    collegeIds.set(slug, existing._id);
    keptColleges++;
    continue;
  }
  const res = await Colleges.findOneAndUpdate(
    { slug },
    { $set: { ...rest, updatedAt: now, seededAt: now }, $setOnInsert: { slug, createdAt: now } },
    { upsert: true, returnDocument: "after" },
  );
  collegeIds.set(slug, res._id);
}
console.log(`colleges: ${colleges.length - retired} upserted, ${keptColleges} kept (edited in admin), ${retired} duplicate(s) retired`);

let serial = (await Faculty.find().sort({ serial: -1 }).limit(1).toArray())[0]?.serial ?? 0;
let uploaded = 0, keptFaculty = 0;
for (const f of faculty) {
  const existing = await Faculty.findOne({ slug: f.slug });
  if (editedByAdmin(existing)) {
    keptFaculty++;
    process.stdout.write(`  ${f.slug} (kept: edited in admin)
`);
    continue;
  }
  let photo = existing?.photo ?? null;
  if (f.photo && (forcePhotos || !photo)) {
    const file = path.join(seedDir, "photos", f.photo);
    const res = await cloudinary.uploader.upload(file, {
      folder: CLOUDINARY_FOLDER,
      public_id: `${f.slug}-seed`,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    });
    photo = { publicId: res.public_id, version: res.version, width: res.width, height: res.height, url: res.secure_url };
    uploaded++;
  }
  const doc = {
    name: f.name,
    sortName: plainName(f.name),
    designation: f.designation,
    rank: designationRank(f.designation),
    isHead: !!f.isHead,
    additionalRole: f.additionalRole ?? "",
    collegeId: collegeIds.get(f.college),
    qualification: f.qualification ?? "",
    specialization: f.specialization ?? [],
    email: f.email ?? "",
    phone: f.phone ?? "",
    joined: f.joined ?? "",
    appointment: f.appointment ?? "",
    bio: f.bio ?? "",
    highlights: f.highlights ?? [],
    photo,
    sources: (f.sources ?? []).map((s) => ({ label: s.label, url: s.url ?? "" })),
    notes: f.notes ?? "",
    review: !!f.review,
    updatedAt: now,
    seededAt: now,
  };
  await Faculty.updateOne(
    { slug: f.slug },
    { $set: doc, $setOnInsert: { slug: f.slug, serial: existing ? existing.serial : ++serial, createdAt: now } },
    { upsert: true },
  );
  process.stdout.write(`  ${f.slug}${f.photo ? (photo ? " ✓ photo" : "") : " (no photo)"}\n`);
}
console.log(`faculty: ${faculty.length - keptFaculty} upserted, ${keptFaculty} kept (edited in admin), ${uploaded} photos uploaded to Cloudinary`);
console.log(`totals in ${DB_NAME}: ${await Colleges.countDocuments()} colleges, ${await Faculty.countDocuments()} faculty`);
await client.close();
