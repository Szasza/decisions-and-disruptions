"use server";

import { cookies } from "next/headers";
import { roomStore } from "@/lib/rooms/store";

export async function joinRoomAction(
  code: string,
  displayName: string,
): Promise<void> {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("dd_player_id")?.value;
  if (!participantId) {
    throw new Error("Missing player identity cookie");
  }

  const result = roomStore.joinRoom(code, { participantId, displayName });
  if (!result.ok) {
    throw new Error(`Room not found: ${code}`);
  }
}
