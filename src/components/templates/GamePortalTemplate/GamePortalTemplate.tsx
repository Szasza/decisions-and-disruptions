import type { JSX } from "react";
import { GameList } from "@/components/organisms/GameList/GameList";
import type { Game } from "@/lib/games/types";

export interface GamePortalTemplateProps {
  games: Game[];
  action: (gameId: string) => void | Promise<void>;
}

export function GamePortalTemplate({
  games,
  action,
}: GamePortalTemplateProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-100">Choose a game</h1>
        <p className="text-sm text-slate-400">
          Pick a game to start a new room and invite others to join.
        </p>
      </div>
      <GameList games={games} action={action} />
    </div>
  );
}
