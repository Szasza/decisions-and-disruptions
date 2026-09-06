import type { JSX } from "react";
import { CopyButton } from "@/components/atoms/CopyButton/CopyButton";

export interface ShareableLinkProps {
  url: string;
}

export function ShareableLink({ url }: ShareableLinkProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        aria-label="Shareable link"
        onFocus={(event) => event.currentTarget.select()}
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
      />
      <CopyButton value={url} />
    </div>
  );
}
