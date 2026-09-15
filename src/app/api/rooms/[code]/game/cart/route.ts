import { cookies } from "next/headers";
import { gameStore } from "@/lib/decisions-disruptions/store";
import { roomStore } from "@/lib/rooms/store";

interface CartRequestBody {
  defenceName?: unknown;
  action?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const cookieStore = await cookies();
  const participantId = cookieStore.get("dd_player_id")?.value;
  const room = roomStore.getRoom(code);
  if (
    !participantId ||
    !room?.participants.some((p) => p.id === participantId)
  ) {
    return Response.json(
      { error: "Not a participant in this room" },
      { status: 403 },
    );
  }

  const body: CartRequestBody = await request.json().catch(() => ({}));
  const { defenceName, action } = body;
  if (
    typeof defenceName !== "string" ||
    (action !== "add" && action !== "remove")
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = gameStore.updateCart(code, defenceName, action);
  if (!result.ok) {
    const status = result.reason === "not-found" ? 404 : 400;
    return Response.json({ error: result.reason }, { status });
  }

  return new Response(null, { status: 204 });
}
