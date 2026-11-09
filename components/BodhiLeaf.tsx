/** Line drawing of a Bodhi (peepal) leaf, the emblem of Bodh Gaya. */
export function BodhiLeaf({
  className,
  animate = false,
  filled = false,
}: {
  className?: string;
  animate?: boolean;
  filled?: boolean;
}) {
  const draw = animate ? "draw-path" : undefined;
  return (
    <svg viewBox="0 0 100 150" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path
        className={draw}
        style={{ ["--len" as string]: 420 }}
        d="M50 16 C 22 4, 1 30, 7 60 C 13 89, 40 105, 50 142 C 60 105, 87 89, 93 60 C 99 30, 78 4, 50 16 Z"
        strokeWidth={2.2}
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.08 : undefined}
      />
      <path className={draw} style={{ ["--len" as string]: 140 }} d="M50 16 L50 134 M50 16 C 50 10, 53 4, 58 1" strokeWidth={1.6} />
      <path
        className={draw}
        style={{ ["--len" as string]: 70 }}
        strokeWidth={1.1}
        d="M50 36 C 40 37, 28 34, 17 41 M50 36 C 60 37, 72 34, 83 41 M50 56 C 39 58, 25 58, 12 66 M50 56 C 61 58, 75 58, 88 66 M50 78 C 40 81, 29 83, 20 92 M50 78 C 60 81, 71 83, 80 92 M50 100 C 44 104, 38 107, 33 114 M50 100 C 56 104, 62 107, 67 114"
      />
    </svg>
  );
}
