import type { CollegeType } from "./types";

export type GroupBy = "college" | "designation" | "none";
export type ViewMode = "cards" | "ledger";

export interface Filters {
  q: string;
  types: CollegeType[];
  districts: string[];
  ranks: number[];
  college: string; // college slug
  heads: boolean;
  group: GroupBy;
  view: ViewMode;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  types: [],
  districts: [],
  ranks: [],
  college: "",
  heads: false,
  group: "college",
  view: "cards",
};

const TYPES: CollegeType[] = ["university", "constituent", "minority", "government", "affiliated"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const list = (v: string | string[] | undefined) =>
  one(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const group = one(sp.group);
  const view = one(sp.view);
  return {
    q: one(sp.q).slice(0, 100),
    types: list(sp.type).filter((t): t is CollegeType => TYPES.includes(t as CollegeType)),
    districts: list(sp.district).slice(0, 10),
    ranks: list(sp.rank)
      .map(Number)
      .filter((n) => n >= 1 && n <= 5),
    college: one(sp.college).slice(0, 120),
    heads: one(sp.heads) === "1",
    group: group === "designation" || group === "none" ? group : "college",
    view: view === "ledger" ? "ledger" : "cards",
  };
}

export function filtersToQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.types.length) p.set("type", f.types.join(","));
  if (f.districts.length) p.set("district", f.districts.join(","));
  if (f.ranks.length) p.set("rank", f.ranks.join(","));
  if (f.college) p.set("college", f.college);
  if (f.heads) p.set("heads", "1");
  if (f.group !== "college") p.set("group", f.group);
  if (f.view !== "cards") p.set("view", f.view);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const activeFilterCount = (f: Filters) =>
  (f.q ? 1 : 0) + f.types.length + f.districts.length + f.ranks.length + (f.college ? 1 : 0) + (f.heads ? 1 : 0);
