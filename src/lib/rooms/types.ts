export interface Participant {
  id: string;
  displayName: string;
  joinedAt: number;
  lastSeenAt: number;
}

export type RoomStatus = "waiting" | "in-progress" | "closed";

export interface Room {
  code: string;
  gameId: string;
  hostParticipantId: string;
  participants: Participant[];
  status: RoomStatus;
  createdAt: number;
}
