"use client";

/* eslint-disable @next/next/no-img-element -- previews are local blob: URLs */
import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { Portrait } from "@/components/Portrait";
import type { Photo } from "@/lib/types";

/** Downscale and re-encode in the browser so uploads stay small and fast. */
async function compress(file: File, max = 1400, quality = 0.88): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Could not encode image");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "portrait"}.jpg`, { type: "image/jpeg" });
}

export function PhotoField({ current, name, error }: { current: Photo | null; name: string; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [problem, setProblem] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProblem("Please choose an image file (JPEG, PNG or WebP).");
      return;
    }
    setBusy(true);
    setProblem("");
    try {
      const small = await compress(file);
      const dt = new DataTransfer();
      dt.items.add(small);
      if (input.current) input.current.files = dt.files;
      setPreview(URL.createObjectURL(small));
      setRemoved(false);
    } catch {
      setProblem("That image could not be read. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
    }
  }

  function clearChosen() {
    if (input.current) input.current.value = "";
    setPreview(null);
  }

  const showing = preview ? "new" : current && !removed ? "current" : "none";

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={`relative rounded-[6px] border bg-card p-3 transition-colors ${drag ? "border-accent bg-accent-soft/40" : "border-rule"}`}
      >
        {showing === "new" && preview ? (
          <div className="portrait portrait-mounts vivid aspect-[4/5]">
            <img src={preview} alt="New portrait preview" className="absolute inset-0 size-full object-cover" />
          </div>
        ) : (
          <Portrait photo={showing === "current" ? current : null} name={name || "New entry"} sizes="320px" vivid monogramSize="text-6xl" showAwaiting />
        )}
        {busy && (
          <div className="absolute inset-3 grid place-items-center bg-card/70 backdrop-blur-sm">
            <LoaderCircle className="size-6 animate-spin text-muted" />
          </div>
        )}
        {showing === "new" && <span className="absolute left-5 top-5 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] text-paper">New, will upload on save</span>}
        {removed && <span className="absolute left-5 top-5 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] text-white">Will be deleted on save</span>}
      </div>

      <input ref={input} type="file" name="photo" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => accept(e.target.files?.[0])} />
      <input type="hidden" name="removePhoto" value={removed ? "1" : ""} />

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm" onClick={() => input.current?.click()} disabled={busy}>
          <ImagePlus className="size-3.5" /> {showing === "none" ? "Add photo" : "Replace"}
        </button>
        {showing === "new" && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={clearChosen}>
            <RotateCcw className="size-3.5" /> Discard new
          </button>
        )}
        {showing === "current" && (
          <button type="button" className="btn btn-sm btn-ghost text-accent" onClick={() => setRemoved(true)}>
            <Trash2 className="size-3.5" /> Remove
          </button>
        )}
        {removed && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setRemoved(false)}>
            <RotateCcw className="size-3.5" /> Keep photo
          </button>
        )}
      </div>
      <p className="mt-2 text-[0.75rem] leading-relaxed text-faint">Drop an image here or choose one. It is resized in your browser and stored on Cloudinary. Faces are centred automatically.</p>
      {(problem || error) && (
        <p role="alert" className="mt-2 text-[0.8rem] text-accent">
          {problem || error}
        </p>
      )}
    </div>
  );
}
