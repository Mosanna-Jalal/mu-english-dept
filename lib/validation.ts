import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/i.test(v), "Use a full link starting with http:// or https://");

export const sourceSchema = z.object({
  label: z.string().trim().min(1, "Describe the source").max(200),
  url: optionalUrl,
});

export const facultySchema = z.object({
  name: z.string().trim().min(3, "Enter the full name").max(120),
  designation: z.string().trim().min(2, "Choose a designation").max(80),
  order: z.union([z.literal(""), z.coerce.number().int("Use a whole number").min(1, "Use 1 or more").max(999)]),
  isHead: z.boolean(),
  additionalRole: z.string().trim().max(120),
  collegeId: z.string().regex(/^[a-f0-9]{24}$/, "Choose an institution"),
  qualification: z.string().trim().max(200),
  specialization: z.array(z.string().trim().min(1).max(80)).max(12, "Keep it to 12 areas or fewer"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || /^\+?[\d][\d\s/-]{6,}$/.test(v), "Enter a valid phone number"),
  joined: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(v), "Use YYYY, YYYY-MM or YYYY-MM-DD"),
  appointment: z.string().trim().max(40),
  bio: z.string().trim().max(3000, "Keep the profile under 3,000 characters"),
  highlights: z.array(z.string().trim().min(1).max(400)).max(25, "Keep it to 25 lines or fewer"),
  sources: z.array(sourceSchema).max(10),
  notes: z.string().trim().max(2000),
  review: z.boolean(),
});

/** Splits a textarea into trimmed, non-empty lines (bullets and numbering removed). */
export const linesFrom = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

export const collegeSchema = z.object({
  name: z.string().trim().min(3, "Enter the institution's name").max(160),
  shortName: z.string().trim().max(80),
  type: z.enum(["university", "constituent", "minority", "government", "affiliated"], { message: "Choose a type" }),
  location: z.string().trim().max(80),
  district: z.string().trim().max(40),
  website: optionalUrl,
  principal: z.string().trim().max(120),
  principalTitle: z.string().trim().max(60),
  phone: z.string().trim().max(40),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  collegeCode: z.string().trim().max(20),
  established: z.union([z.literal(""), z.coerce.number().int().min(1800).max(2100)]),
  englishStatus: z.enum(["active", "vacant", "unknown"]),
  englishSeats: z.union([z.literal(""), z.coerce.number().int().min(0).max(5000)]),
  notes: z.string().trim().max(2000),
});

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export function sourcesFrom(fd: FormData) {
  const labels = fd.getAll("sourceLabel").map(String);
  const urls = fd.getAll("sourceUrl").map(String);
  return labels
    .map((label, i) => ({ label: label.trim(), url: (urls[i] ?? "").trim() }))
    .filter((s) => s.label || s.url)
    .map((s) => ({ label: s.label || s.url, url: s.url }));
}
