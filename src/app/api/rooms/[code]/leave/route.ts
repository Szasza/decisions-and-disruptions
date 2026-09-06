import { cookies } from "next/headers";
import { roomStore } from "@/lib/rooms/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const cookieStore = await cookies();
  const participantId = cookieStore.get("dd_player_id")?.value;
  if (participantId) {
    roomStore.leaveRoom(code, participantId);
  }
  return new Response(null, { status: 204 });
}
