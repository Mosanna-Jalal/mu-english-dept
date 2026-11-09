import type { CollegeType } from "./types";

export const SITE = {
  title: "The Register of English Faculty",
  university: "Magadh University, Bodh Gaya",
  description:
    "A directory of the teachers of English across the University Department, constituent, minority, government and affiliated colleges of Magadh University, Bodh Gaya.",
};

/**
 * Personal mobile numbers are shown in full only inside the admin panel.
 * Set this to true if every faculty member has agreed to public display.
 */
export const SHOW_FULL_PHONE_PUBLICLY = false;

export const COLLEGE_TYPES: { value: CollegeType; label: string; plural: string; blurb: string }[] = [
  { value: "university", label: "University Department", plural: "University Department", blurb: "The P.G. Department of English on the Bodh Gaya campus." },
  { value: "constituent", label: "Constituent College", plural: "Constituent Colleges", blurb: "Colleges maintained directly by the University." },
  { value: "government", label: "Government College", plural: "Government Colleges", blurb: "Degree colleges run by the Government of Bihar." },
  { value: "minority", label: "Minority Institution", plural: "Minority Institutions", blurb: "Colleges with minority status, affiliated to the University." },
  { value: "affiliated", label: "Affiliated College", plural: "Affiliated Colleges", blurb: "Privately managed colleges affiliated to the University." },
];

export const typeLabel = (t: CollegeType) => COLLEGE_TYPES.find((x) => x.value === t)?.label ?? t;
export const typePlural = (t: CollegeType) => COLLEGE_TYPES.find((x) => x.value === t)?.plural ?? t;

export const DISTRICTS = ["Gaya", "Aurangabad", "Nawada", "Jehanabad", "Arwal"] as const;

/** Designations, most senior first. `rank` drives sorting and the designation filter. */
export const DESIGNATIONS = [
  { value: "Professor", rank: 1, group: "Professor" },
  { value: "University Professor", rank: 1, group: "Professor" },
  { value: "Associate Professor", rank: 2, group: "Associate Professor" },
  { value: "Assistant Professor (Senior Scale)", rank: 3, group: "Assistant Professor (Sr. Scale)" },
  { value: "Assistant Professor", rank: 4, group: "Assistant Professor" },
  { value: "Guest Faculty", rank: 5, group: "Guest & Other" },
  { value: "Guest / Other", rank: 5, group: "Guest & Other" },
] as const;

export const DESIGNATION_GROUPS = ["Professor", "Associate Professor", "Assistant Professor (Sr. Scale)", "Assistant Professor", "Guest & Other"];

export function designationRank(designation: string): number {
  const d = designation.trim().toLowerCase();
  const exact = DESIGNATIONS.find((x) => x.value.toLowerCase() === d);
  if (exact) return exact.rank;
  if (d.includes("associate")) return 2;
  if (d.includes("assistant") && /(senior|sr\.?)/.test(d)) return 3;
  if (d.includes("assistant")) return 4;
  if (d.includes("professor")) return 1;
  return 5;
}

export const groupOfRank = (rank: number) => DESIGNATION_GROUPS[Math.min(Math.max(rank, 1), 5) - 1];

export const APPOINTMENTS = ["Permanent", "Guest", "Contractual", "Deputation"];

export const DEVELOPER = {
  monogram: "MJ",
  role: "Full-Stack Developer",
  place: "Gaya, Bihar",
  portfolio: "https://me-mj.vercel.app",
  email: "mjiraqui322@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/Mosanna-Jalal" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mosanna-jalal-2a1a931aa/" },
    { label: "Instagram", href: "https://www.instagram.com/theycallme_mj__/" },
    { label: "X", href: "https://x.com/JalalMosanna" },
  ],
};
