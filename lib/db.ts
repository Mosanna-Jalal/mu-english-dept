import { MongoClient, type Db, type ObjectId } from "mongodb";
import type { CollegeType, EnglishStatus, Photo, Source } from "./types";

export interface CollegeDoc {
  _id: ObjectId;
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
  englishSeats?: number | null;
  notes: string;
  sources: Source[];
  createdAt: Date;
  updatedAt: Date;
  seededAt?: Date;
}

export interface FacultyDoc {
  _id: ObjectId;
  slug: string;
  serial: number;
  name: string;
  sortName: string;
  designation: string;
  rank: number;
  order?: number | null;
  isHead: boolean;
  additionalRole: string;
  collegeId: ObjectId;
  qualification: string;
  specialization: string[];
  email: string;
  phone: string;
  joined: string;
  appointment: string;
  bio?: string;
  highlights?: string[];
  photo: Photo | null;
  sources: Source[];
  notes: string;
  review: boolean;
  createdAt: Date;
  updatedAt: Date;
  seededAt?: Date;
}

declare global {
  var __muEnglishMongo: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  const uri = process.env.DB_URI;
  if (!uri) throw new Error("DB_URI is not set. Add it to .env.local.");
  const promise = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 15000 }).connect();
  // If the first connection fails, forget it so the next request retries.
  promise.catch(() => {
    if (globalThis.__muEnglishMongo === promise) globalThis.__muEnglishMongo = undefined;
  });
  return promise;
}

export async function getDb(): Promise<Db> {
  globalThis.__muEnglishMongo ??= connect();
  const client = await globalThis.__muEnglishMongo;
  return client.db(process.env.DB_NAME || "english_faculty_database");
}

export async function collections() {
  const db = await getDb();
  return {
    faculty: db.collection<FacultyDoc>("faculty"),
    colleges: db.collection<CollegeDoc>("colleges"),
  };
}
