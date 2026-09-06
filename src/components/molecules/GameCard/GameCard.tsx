"use client";

import { type JSX, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import type { Game } from "@/lib/games/types";

export interface GameCardProps {
  game: Game;
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
}

function formatPlayers(game: Game): string | undefined {
  if (game.minPlayers === undefined && game.maxPlayers === undefined) {
    return undefined;
  }
  if (
    game.minPlayers !== undefined &&
    game.maxPlayers !== undefined &&
    game.minPlayers !== game.maxPlayers
  ) {
    return `${game.minPlayers}–${game.maxPlayers} players`;
  }
  const count = game.minPlayers ?? game.maxPlayers;
  return `${count} players`;
}

export function GameCard({
  game,
  onSelect,
  disabled = false,
}: GameCardProps): JSX.Element {
  const [isPending, setIsPending] = useState(false);

  const playersLabel = formatPlayers(game);

  const handleClick = async () => {
    setIsPending(true);
    try {
      await onSelect();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-100">{game.name}</h3>
        <p className="text-sm leading-6 text-slate-300">{game.description}</p>
      </div>
      {(playersLabel || game.estimatedMinutes !== undefined) && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          {playersLabel && <span>{playersLabel}</span>}
          {game.estimatedMinutes !== undefined && (
            <span>~{game.estimatedMinutes} min</span>
          )}
        </div>
      )}
      <Button
        variant="primary"
        onClick={handleClick}
        disabled={disabled}
        loading={isPending}
      >
        Create room
      </Button>
    </div>
  );
}
