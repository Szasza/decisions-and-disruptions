import type { JSX } from "react";
import { formatRelativeTime } from "@/lib/format/relativeTime";
import type { Participant } from "@/lib/rooms/types";

export interface ParticipantListItemProps {
  participant: Participant;
  isCurrentParticipant?: boolean;
  isGameMaster?: boolean;
  now?: number;
}

export function ParticipantListItem({
  participant,
  isCurrentParticipant = false,
  isGameMaster = false,
  now,
}: ParticipantListItemProps): JSX.Element {
  const relativeTime = formatRelativeTime(
    participant.joinedAt,
    now ?? Date.now(),
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-200"
        >
          {participant.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-medium text-slate-100">
          {participant.displayName}
        </span>
        {isCurrentParticipant && (
          <span className="text-xs font-medium text-sky-400">(you)</span>
        )}
        {isGameMaster && (
          <span className="text-xs font-medium text-amber-400">
            Game Master
          </span>
        )}
      </div>
      <span className="text-xs text-slate-400">joined {relativeTime}</span>
    </div>
  );
}
