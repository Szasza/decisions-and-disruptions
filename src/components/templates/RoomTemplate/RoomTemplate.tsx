import type { JSX } from "react";
import { JoinRoomPanel } from "@/components/organisms/JoinRoomPanel/JoinRoomPanel";
import { RoomLobby } from "@/components/organisms/RoomLobby/RoomLobby";
import type { Game } from "@/lib/games/types";
import type { Room } from "@/lib/rooms/types";

export type RoomTemplateProps =
  | {
      mode: "join";
      game: Game;
      action: (displayName: string) => void | Promise<void>;
      error?: string;
    }
  | {
      mode: "lobby";
      game: Game;
      initialRoom: Room;
      roomCode: string;
      currentParticipantId: string;
      shareUrl: string;
      onLeave: () => void;
      onRemoved: () => void;
    };

export function RoomTemplate(props: RoomTemplateProps): JSX.Element {
  if (props.mode === "join") {
    return (
      <JoinRoomPanel
        game={props.game}
        action={props.action}
        error={props.error}
      />
    );
  }

  return (
    <RoomLobby
      initialRoom={props.initialRoom}
      roomCode={props.roomCode}
      currentParticipantId={props.currentParticipantId}
      game={props.game}
      shareUrl={props.shareUrl}
      onLeave={props.onLeave}
      onRemoved={props.onRemoved}
    />
  );
}
