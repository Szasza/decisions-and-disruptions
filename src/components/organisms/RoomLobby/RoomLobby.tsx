"use client";

import { type JSX, useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { ParticipantListItem } from "@/components/molecules/ParticipantListItem/ParticipantListItem";
import { ShareableLink } from "@/components/molecules/ShareableLink/ShareableLink";
import type { Game } from "@/lib/games/types";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/rooms/constants";
import type { Room } from "@/lib/rooms/types";

export interface RoomLobbyProps {
  initialRoom: Room;
  roomCode: string;
  currentParticipantId: string;
  game: Game;
  shareUrl: string;
  onLeave: () => void;
  onRemoved: () => void;
  /**
   * Test-only override of the heartbeat interval. Defaults to the real
   * `HEARTBEAT_INTERVAL_MS` in production; stories inject a much shorter
   * value so play functions can exercise the real interval-based code path
   * without waiting on (or fighting fake timers around) a real 30s timer.
   */
  heartbeatIntervalMs?: number;
}

export function RoomLobby({
  initialRoom,
  roomCode,
  currentParticipantId,
  game,
  shareUrl,
  onLeave,
  onRemoved,
  heartbeatIntervalMs = HEARTBEAT_INTERVAL_MS,
}: RoomLobbyProps): JSX.Element {
  const [room, setRoom] = useState(initialRoom);

  useEffect(() => {
    const source = new EventSource(`/api/rooms/${roomCode}/events`);
    source.onmessage = (event) => {
      setRoom(JSON.parse(event.data));
    };
    return () => {
      source.close();
    };
  }, [roomCode]);

  useEffect(() => {
    let removed = false;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/rooms/${roomCode}/heartbeat`, {
        method: "POST",
      });
      if (res.status === 410 && !removed) {
        removed = true;
        clearInterval(interval);
        onRemoved();
      }
    }, heartbeatIntervalMs);

    return () => {
      removed = true;
      clearInterval(interval);
    };
  }, [roomCode, heartbeatIntervalMs, onRemoved]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-slate-100">{game.name}</h2>
      <ShareableLink url={shareUrl} />
      <div className="flex flex-col gap-2">
        {room.participants.map((participant) => (
          <ParticipantListItem
            key={participant.id}
            participant={participant}
            isCurrentParticipant={participant.id === currentParticipantId}
          />
        ))}
      </div>
      <Button variant="secondary" onClick={onLeave}>
        Leave room
      </Button>
    </div>
  );
}
