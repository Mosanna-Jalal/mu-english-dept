import type { Photo } from "./types";

const HONORIFICS = /^(prof\.?|dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt\.?|sri)\s*(\(\s*dr\.?\s*\))?\s*/i;

/** "Prof. (Dr.) Neeraj Kumar" -> "Neeraj Kumar" */
export function plainName(name: string): string {
  let n = name.trim();
  for (let i = 0; i < 4; i++) n = n.replace(HONORIFICS, "").trim();
  return n;
}

export function initials(name: string): string {
  const parts = plainName(name).replace(/^(md\.?|mohd\.?|mohammad)\s+/i, "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function slugify(s: string): string {
  return plainName(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  if (digits.length < 6) return "";
  return `${digits.slice(0, 2)}••• ••${digits.slice(-3)}`;
}

export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return d.length === 10 ? `${d.slice(0, 5)} ${d.slice(5)}` : phone;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Accepts "2025", "2025-08" or "2025-08-25". */
export function formatJoined(value: string): string {
  const m = value.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) return value;
  const [, y, mo, d] = m;
  if (!mo) return y;
  const month = MONTHS[Number(mo) - 1] ?? "";
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}

/** Catalogue number shown on the cards, e.g. "MU·ENG·007". */
export function catalogueNo(serial: number): string {
  return `MU·ENG·${String(serial).padStart(3, "0")}`;
}

export function photoSrc(photo: Photo, opts: { aspect?: string; gravity?: string } = {}): string {
  const cloud = photo.url.match(/res\.cloudinary\.com\/([^/]+)\//)?.[1];
  const base = cloud ? `https://res.cloudinary.com/${cloud}/image/upload` : "";
  if (!base) return photo.url;
  const t = [`c_fill`, `g_${opts.gravity ?? "face"}`, `ar_${opts.aspect ?? "4:5"}`].join(",");
  return `${base}/${t}/v${photo.version}/${photo.publicId}`;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
