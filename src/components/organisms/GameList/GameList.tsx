"use client";

import type { JSX } from "react";
import { GameCard } from "@/components/molecules/GameCard/GameCard";
import type { Game } from "@/lib/games/types";

export interface GameListProps {
  games: Game[];
  action: (gameId: string) => void | Promise<void>;
}

export function GameList({ games, action }: GameListProps): JSX.Element {
  if (games.length === 0) {
    return <p className="text-sm text-slate-400">No games available yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onSelect={() => action(game.id)} />
      ))}
    </div>
  );
}
