import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { Photo } from "./types";

let configured = false;
function client() {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials are missing. Check .env.local.");
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

const folder = () => process.env.CLOUDINARY_FOLDER || "mu-english/faculty";

/** Uploads a portrait. A fresh public id per upload avoids stale CDN copies. */
export async function uploadPortrait(data: Buffer, slug: string): Promise<Photo> {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      {
        folder: folder(),
        public_id: `${slug}-${Date.now().toString(36)}`,
        resource_type: "image",
        overwrite: false,
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
        context: { alt: slug },
      },
      (error, res) => (error || !res ? reject(error ?? new Error("Upload failed")) : resolve(res)),
    );
    stream.end(data);
  });
  return {
    publicId: result.public_id,
    version: result.version,
    width: result.width,
    height: result.height,
    url: result.secure_url,
  };
}

/**
 * Deletes a portrait from Cloudinary (and purges CDN copies).
 * Resolves for "ok" and "not found"; throws on anything else so callers can stop
 * before removing the database record and leaving an orphaned image behind.
 */
export async function destroyPortrait(publicId: string): Promise<"ok" | "not found"> {
  const res = await client().uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
  if (res.result === "ok" || res.result === "not found") return res.result;
  throw new Error(`Cloudinary could not delete the photo (${res.result ?? "unknown error"}).`);
}
