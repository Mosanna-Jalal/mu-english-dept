"use client";

/**
 * next/image loader for Cloudinary. Keeps any base transformation already in the
 * URL (e.g. the face-aware crop added by `photoSrc`) and chains a resize after it.
 */
export default function cloudinaryLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const marker = "/image/upload/";
  const i = src.indexOf(marker);
  if (i === -1) return src;
  const head = src.slice(0, i + marker.length);
  const rest = src.slice(i + marker.length);
  const [first, ...others] = rest.split("/");
  const isTransform = /^[a-z]{1,3}_[^/]*$/.test(first) && !/^v\d+$/.test(first);
  const resize = `c_limit,w_${width},f_auto,q_auto`;
  return isTransform ? `${head}${first}/${resize}/${others.join("/")}` : `${head}${resize}/${rest}`;
}
