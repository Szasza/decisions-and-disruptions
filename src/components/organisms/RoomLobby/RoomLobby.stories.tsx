import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  expect,
  fn,
  userEvent,
  waitForElementToBeRemoved,
  within,
} from "storybook/test";

import type { Game } from "@/lib/games/types";
import type { Room } from "@/lib/rooms/types";
import { RoomLobby } from "./RoomLobby";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  close = fn();

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
}

const meta = {
  title: "Organisms/RoomLobby",
  component: RoomLobby,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    onLeave: fn(),
    onRemoved: fn(),
  },
} satisfies Meta<typeof RoomLobby>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleGame: Game = {
  id: "decisions-and-disruptions",
  name: "Decisions & Disruptions",
  description:
    "A tabletop cybersecurity decision-making game where players respond to unfolding incidents as a team.",
  minPlayers: 3,
  maxPlayers: 6,
  estimatedMinutes: 90,
};

const sampleRoom: Room = {
  code: "AB12CD",
  gameId: sampleGame.id,
  hostParticipantId: "participant-1",
  participants: [
    {
      id: "participant-1",
      displayName: "Ada",
      joinedAt: 1000,
      lastSeenAt: 1000,
    },
  ],
  status: "waiting",
  createdAt: 1000,
};

export const Default: Story = {
  args: {
    initialRoom: sampleRoom,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    game: sampleGame,
    shareUrl: "https://example.com/room/AB12CD",
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ada")).toBeVisible();
    await expect(canvas.getByText("Game Master")).toBeVisible();
    await expect(
      canvas.getByDisplayValue("https://example.com/room/AB12CD"),
    ).toBeVisible();
  },
};

export const ReceivesARealtimeUpdate: Story = {
  args: {
    initialRoom: sampleRoom,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    game: sampleGame,
    shareUrl: "https://example.com/room/AB12CD",
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ada")).toBeVisible();

    const updatedRoom: Room = {
      ...sampleRoom,
      participants: [
        ...sampleRoom.participants,
        {
          id: "participant-2",
          displayName: "Grace",
          joinedAt: 2000,
          lastSeenAt: 2000,
        },
      ],
    };

    const source =
      FakeEventSource.instances[FakeEventSource.instances.length - 1];
    source.onmessage?.({ data: JSON.stringify(updatedRoom) });

    await expect(await canvas.findByText("Grace")).toBeVisible();
  },
};

export const GameMasterReassignedLive: Story = {
  args: {
    initialRoom: {
      ...sampleRoom,
      participants: [
        ...sampleRoom.participants,
        {
          id: "participant-2",
          displayName: "Grace",
          joinedAt: 2000,
          lastSeenAt: 2000,
        },
      ],
    },
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-2",
    game: sampleGame,
    shareUrl: "https://example.com/room/AB12CD",
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Ada (participant-1) starts as Game Master; Grace (participant-2, the
    // viewer in this story) is not.
    await expect(canvas.getByText("Ada")).toBeVisible();
    await expect(canvas.getByText("Game Master")).toBeVisible();

    // Simulate the server reassigning the Game Master after Ada leaves or
    // goes stale — the store already broadcasts the updated room (with a
    // new hostParticipantId) to every subscriber over SSE, so this proves
    // every joined client's UI picks up the reassignment live, with no
    // action from the viewer.
    const roomAfterHostLeft: Room = {
      ...sampleRoom,
      hostParticipantId: "participant-2",
      participants: [
        {
          id: "participant-2",
          displayName: "Grace",
          joinedAt: 2000,
          lastSeenAt: 2000,
        },
      ],
    };

    const adaBefore = canvas.getByText("Ada");
    const source =
      FakeEventSource.instances[FakeEventSource.instances.length - 1];
    source.onmessage?.({ data: JSON.stringify(roomAfterHostLeft) });

    // Wait for the state update triggered by onmessage to actually commit
    // (Ada's row is removed) rather than racing it with a plain query.
    await waitForElementToBeRemoved(adaBefore);

    // The badge now sits on Grace's row (the viewer), alongside "(you)".
    const graceRow = canvas.getByText("Grace").closest("div");
    await expect(
      graceRow ? within(graceRow).getByText("Game Master") : null,
    ).toBeVisible();
  },
};

export const HeartbeatFires: Story = {
  args: {
    initialRoom: sampleRoom,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    game: sampleGame,
    shareUrl: "https://example.com/room/AB12CD",
    heartbeatIntervalMs: 50,
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ada")).toBeVisible();

    await new Promise((resolve) => setTimeout(resolve, 200));

    await expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/heartbeat"),
      expect.objectContaining({ method: "POST" }),
    );
  },
};

export const RemovedOn410: Story = {
  args: {
    initialRoom: sampleRoom,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    game: sampleGame,
    shareUrl: "https://example.com/room/AB12CD",
    heartbeatIntervalMs: 50,
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 410 }) as never;
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ada")).toBeVisible();

    await new Promise((resolve) => setTimeout(resolve, 200));

    await expect(args.onRemoved).toHaveBeenCalled();
  },
};

export const LeaveButton: Story = {
  args: {
    initialRoom: sampleRoom,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    game: sampleGame,
    shareUrl: "https://example.com/room/AB12CD",
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Leave room" });
    await userEvent.click(button);
    await expect(args.onLeave).toHaveBeenCalledTimes(1);
  },
};
