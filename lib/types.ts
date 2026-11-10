export type CollegeType = "university" | "constituent" | "minority" | "government" | "affiliated";
export type EnglishStatus = "active" | "vacant" | "unknown";

export interface Source {
  label: string;
  url?: string;
}

export interface Photo {
  publicId: string;
  version: number;
  width: number;
  height: number;
  url: string;
}

export interface College {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: CollegeType;
  location: string;
  district: string;
  website: string;
  principal: string;
  principalTitle: string;
  phone: string;
  email: string;
  collegeCode?: string;
  established: number | null;
  englishStatus: EnglishStatus;
  /** B.A. English (major) seats in the University's 2026–30 admissions; null when unknown. */
  englishSeats: number | null;
  notes: string;
  sources: Source[];
  facultyCount: number;
}

/** Faculty record as exposed to the public site (phone masked, internal notes removed). */
export interface Faculty {
  id: string;
  slug: string;
  serial: number;
  name: string;
  sortName: string;
  designation: string;
  rank: number;
  /** Manual position within the college (lower first); null = automatic (head, rank, name). */
  order: number | null;
  isHead: boolean;
  additionalRole: string;
  collegeId: string;
  qualification: string;
  specialization: string[];
  email: string;
  phone: string;
  joined: string;
  appointment: string;
  /** Short public profile paragraph. */
  bio: string;
  /** Distinctions, research record and selected publications, one item each. */
  highlights: string[];
  photo: Photo | null;
  sources: Source[];
  updatedAt: string;
}

/** Full record, only ever returned to an authenticated admin. */
export interface AdminFaculty extends Faculty {
  notes: string;
  review: boolean;
  createdAt: string;
}

export interface Register {
  colleges: College[];
  faculty: Faculty[];
  updatedAt: string;
}
