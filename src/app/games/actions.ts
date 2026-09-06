"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getGameById } from "@/lib/games/catalog";
import { roomStore } from "@/lib/rooms/store";

export async function createRoomAction(
  gameId: string,
  hostDisplayName: string,
): Promise<void> {
  const game = getGameById(gameId);
  if (!game) {
    throw new Error(`Unknown game: ${gameId}`);
  }

  const cookieStore = await cookies();
  const hostParticipantId = cookieStore.get("dd_player_id")?.value;
  if (!hostParticipantId) {
    throw new Error("Missing player identity cookie");
  }

  const { room } = roomStore.createRoom({
    gameId,
    hostDisplayName,
    hostParticipantId,
  });
  redirect(`/room/${room.code}`);
}
