import { cookies } from "next/headers";
import { roomStore } from "@/lib/rooms/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const cookieStore = await cookies();
  const participantId = cookieStore.get("dd_player_id")?.value;
  const found = participantId
    ? roomStore.touchParticipant(code, participantId)
    : false;

  if (!found) {
    return Response.json({ removed: true }, { status: 410 });
  }
  return new Response(null, { status: 204 });
}
