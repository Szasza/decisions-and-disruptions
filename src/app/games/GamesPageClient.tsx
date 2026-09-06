"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { DisplayNameForm } from "@/components/molecules/DisplayNameForm/DisplayNameForm";
import { GamePortalTemplate } from "@/components/templates/GamePortalTemplate/GamePortalTemplate";
import { GAMES } from "@/lib/games/catalog";
import { createRoomAction } from "./actions";

export function GamesPageClient() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!displayName) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-100">Welcome</h1>
          <p className="text-sm text-slate-400">
            Enter a display name to create a game room.
          </p>
        </div>
        <DisplayNameForm
          submitLabel="Continue"
          action={(name) => setDisplayName(name)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {createError && (
        <p className="text-sm text-red-400" role="alert">
          {createError}
        </p>
      )}
      <GamePortalTemplate
        games={[...GAMES]}
        action={async (gameId) => {
          try {
            await createRoomAction(gameId, displayName);
          } catch (error) {
            // createRoomAction calls redirect() on success, which Next.js
            // implements as a thrown internal signal — let that (and any
            // other framework-internal throw) propagate before treating
            // this as a real failure.
            unstable_rethrow(error);
            setCreateError("Couldn't create a room. Please try again.");
          }
        }}
      />
    </div>
  );
}
