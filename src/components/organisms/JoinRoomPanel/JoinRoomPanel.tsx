import type { JSX } from "react";
import { DisplayNameForm } from "@/components/molecules/DisplayNameForm/DisplayNameForm";
import type { Game } from "@/lib/games/types";

export interface JoinRoomPanelProps {
  game: Game;
  action: (displayName: string) => void | Promise<void>;
  error?: string;
}

export function JoinRoomPanel({
  game,
  action,
  error,
}: JoinRoomPanelProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-300">
          You&apos;re about to join a room for{" "}
          <strong className="font-semibold text-slate-100">{game.name}</strong>
        </p>
        <p className="text-sm leading-6 text-slate-400">{game.description}</p>
      </div>
      <DisplayNameForm action={action} initialError={error} />
    </div>
  );
}
