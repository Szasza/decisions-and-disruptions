import type { JSX } from "react";

export interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  formatValue?: (value: number, max: number) => string;
}

export function ProgressBar({
  label,
  value,
  max,
  formatValue,
}: ProgressBarProps): JSX.Element {
  const ratio = max === 0 ? 0 : value / max;
  const percentage = Math.min(100, Math.max(0, ratio * 100));
  const valueReadout = formatValue
    ? formatValue(value, max)
    : `${value} / ${max}`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm text-slate-300">
        <span>{label}</span>
        <span className="text-slate-400">{valueReadout}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
      >
        <div aria-hidden="true" className="h-full w-full">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
