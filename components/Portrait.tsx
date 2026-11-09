import Image from "next/image";
import { initials, photoSrc } from "@/lib/format";
import type { Photo } from "@/lib/types";

/**
 * A 4:5 portrait with album photo-corners. Falls back to an engraved-style
 * monogram when no photograph has been found yet.
 */
export function Portrait({
  photo,
  name,
  sizes,
  priority = false,
  vivid = false,
  className = "",
  monogramSize = "text-3xl",
  showAwaiting = false,
}: {
  photo: Photo | null;
  name: string;
  sizes: string;
  priority?: boolean;
  vivid?: boolean;
  className?: string;
  monogramSize?: string;
  showAwaiting?: boolean;
}) {
  return (
    <div className={`portrait portrait-mounts aspect-[4/5] ${vivid ? "vivid" : ""} ${className}`}>
      {photo ? (
        <Image
          src={photoSrc(photo)}
          alt={`Portrait of ${name}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="monogram">
          <div className="text-center">
            <span className={`font-display italic ${monogramSize}`} style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              {initials(name)}
            </span>
            {showAwaiting && <span className="mt-2 block eyebrow !text-[0.5625rem]">Photograph awaited</span>}
          </div>
        </div>
      )}
    </div>
  );
}
