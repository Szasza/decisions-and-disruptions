export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { roomStore } from "@/lib/rooms/store";
import type { Room } from "@/lib/rooms/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const room = roomStore.getRoom(code);
  if (!room) {
    return new Response("Room not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let keepAlive: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (nextRoom: Room) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(nextRoom)}\n\n`),
        );
      };
      send(room);
      unsubscribe = roomStore.subscribe(code, send);
      keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15_000);
    },
    cancel() {
      unsubscribe?.();
      if (keepAlive) clearInterval(keepAlive);
    },
  });

  request.signal.addEventListener("abort", () => {
    unsubscribe?.();
    if (keepAlive) clearInterval(keepAlive);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
