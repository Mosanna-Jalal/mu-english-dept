# The Register of English Faculty — Magadh University

A directory of the English faculty across the University Department and the constituent, minority, government and affiliated colleges of Magadh University, Bodh Gaya. It has a public site with search and filters and a password-protected admin panel for corrections.

**Stack:** Next.js 16 (App Router, Cache Components) · MongoDB · Cloudinary · Tailwind CSS 4

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Purpose |
|---|---|
| `DB_URI` | MongoDB connection string |
| `DB_NAME` | Database name (`english_faculty_database`) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Portrait storage |
| `CLOUDINARY_FOLDER` | Folder for portraits (`mu-english/faculty`) |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `ADMIN_SESSION_SECRET` | 32+ random characters used to sign the admin cookie |

## Data

- Collections: `colleges` and `faculty` in `english_faculty_database`.
- `npm run seed` loads `data/seed/colleges.json` and `data/seed/faculty.json`, uploads `data/seed/photos/*` to Cloudinary and upserts by slug, so it is safe to re-run. **Records edited in the admin panel since the last seed are never overwritten** (pass `-- --force` to override). Pass `-- --photos` to force re-uploading every photo, or `-- --photos=slug,slug` to re-upload just those people's photos after replacing their files. Faculty marked `"retired": true` in the seed data are removed together with their Cloudinary photo. `data/seed/` is gitignored because it holds personal phone numbers.
- Colleges come from Magadh University's website plus its 2026–30 UG admissions system, which also supplies each college's official code and B.A. English seats (`englishSeats`).
- Faculty records can carry a public `bio` and a list of `highlights` (distinctions, research record, selected publications).
- Within each college, faculty are listed by their `order` (Display order in the admin form; 1 = first). Anyone without one follows, sorted by head of department, then seniority, then name.
- Public pages read through one cached function (`lib/data.ts → getRegister`). Every admin save or delete calls `updateTag("register")`, so changes appear on the site immediately. Edits made directly in MongoDB Compass show up within an hour.

## Admin panel (`/admin`)

- Add, edit and delete faculty and colleges. Photos are resized in the browser, uploaded to Cloudinary, and centred on the face automatically.
- Deleting a faculty member asks for confirmation, removes the photo from Cloudinary first, and only then deletes the record. If Cloudinary fails, the record is kept so no image is orphaned. Replacing a photo deletes the old one.
- A college with faculty cannot be deleted until they are moved or removed.
- **Export CSV** downloads the full register, including private phone numbers and notes, as a spreadsheet.
- Flag uncertain entries with **Needs review** to find them later with the filter.

## Privacy

Personal mobile numbers are masked on the public site (`SHOW_FULL_PHONE_PUBLICLY` in `lib/constants.ts`). Only signed-in admins see them in full.

## Deploying (Vercel)

1. Add the variables above in the project settings.
2. In MongoDB Atlas → Network Access, allow connections from Vercel (`0.0.0.0/0`, or Vercel's IP ranges). The build reads the database while prerendering.

---

Designed & developed by [Mosanna Jalal](https://me-mj.vercel.app).
