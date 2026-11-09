import type { CSSProperties } from "react";

export interface AlmanacRow {
  value: number;
  label: string;
}

/** A printed-almanac style table of figures with dotted leaders. */
export function Almanac({ title, dateline, rows, className = "" }: { title: string; dateline?: string; rows: AlmanacRow[]; className?: string }) {
  return (
    <div className={`panel relative overflow-hidden p-6 sm:p-7 ${className}`}>
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <p className="font-display text-lg italic">{title}</p>
        {dateline && <p className="eyebrow !text-[0.5625rem]">{dateline}</p>}
      </div>
      <dl className="mt-2">
        {rows.map((r, i) => (
          <div key={r.label} className="rise flex items-baseline gap-3 border-b border-rule-soft py-2.5 last:border-0" style={{ "--i": i + 2 } as CSSProperties}>
            <dt className="text-[0.9rem] text-ink-soft">{r.label}</dt>
            <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-faint" />
            <dd className="font-display text-[1.9rem] leading-none tabular-nums text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
