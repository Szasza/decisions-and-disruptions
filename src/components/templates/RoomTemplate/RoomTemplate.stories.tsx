import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { getDefenceByName } from "@/lib/decisions-disruptions/defences";
import type { GameState } from "@/lib/decisions-disruptions/types";
import type { Game } from "@/lib/games/types";
import type { Room } from "@/lib/rooms/types";
import { RoomTemplate, type RoomTemplateProps } from "./RoomTemplate";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  close = fn();

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
}

const meta = {
  title: "Templates/RoomTemplate",
  component: RoomTemplate,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoomTemplate>;

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

const setupGameState: GameState = {
  phase: "setup",
  round: 1,
  ownedDefences: [],
  cart: [],
  revealHistory: [],
};

// biome-ignore lint/style/noNonNullAssertion: name is hardcoded from the real catalog
const firewallOffice = getDefenceByName("Firewall office")!;

const roundGameState: GameState = {
  phase: "round",
  round: 1,
  ownedDefences: [],
  cart: [],
  revealHistory: [],
};

const finishedGameState: GameState = {
  phase: "finished",
  round: 4,
  ownedDefences: [{ defence: firewallOffice, round: 1 }],
  cart: [],
  revealHistory: [[], [], [], []],
};

export const Join: Story = {
  args: {
    mode: "join",
    game: sampleGame,
    action: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Decisions & Disruptions")).toBeVisible();

    const input = canvas.getByLabelText("Display name");
    const button = canvas.getByRole("button", { name: "Join room" });

    await userEvent.type(input, "Ada");
    await userEvent.click(button);

    const joinArgs = args as Extract<RoomTemplateProps, { mode: "join" }>;
    await expect(joinArgs.action).toHaveBeenCalledWith("Ada");
  },
};

export const LobbySetupHost: Story = {
  args: {
    mode: "lobby",
    game: sampleGame,
    initialRoom: sampleRoom,
    initialGame: setupGameState,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    shareUrl: "https://example.com/room/AB12CD",
    onLeave: fn(),
    onRemoved: fn(),
    onStartGame: fn(),
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ada")).toBeVisible();
    await expect(
      canvas.getByDisplayValue("https://example.com/room/AB12CD"),
    ).toBeVisible();

    const startButton = canvas.getByRole("button", { name: "Start Game" });
    await userEvent.click(startButton);

    const lobbyArgs = args as Extract<RoomTemplateProps, { mode: "lobby" }>;
    await expect(lobbyArgs.onStartGame).toHaveBeenCalledWith({
      includeNationState: false,
    });
  },
};

export const LobbySetupNonHost: Story = {
  args: {
    mode: "lobby",
    game: sampleGame,
    initialRoom: sampleRoom,
    initialGame: setupGameState,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-2",
    shareUrl: "https://example.com/room/AB12CD",
    onLeave: fn(),
    onRemoved: fn(),
    onStartGame: fn(),
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Waiting for the host to start the game..."),
    ).toBeVisible();
    expect(
      canvas.queryByRole("button", { name: "Start Game" }),
    ).not.toBeInTheDocument();
  },
};

export const LobbyRoundPhase: Story = {
  args: {
    mode: "lobby",
    game: sampleGame,
    initialRoom: sampleRoom,
    initialGame: roundGameState,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    shareUrl: "https://example.com/room/AB12CD",
    onLeave: fn(),
    onRemoved: fn(),
    onStartGame: fn(),
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({
      status: 204,
      ok: true,
      json: async () => ({}),
    }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Round 1 / 4")).toBeVisible();

    const addButtons = canvas.getAllByRole("button", { name: "Add to cart" });
    await userEvent.click(addButtons[0]);

    await expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/rooms/${sampleRoom.code}/game/cart`,
      expect.objectContaining({ method: "POST" }),
    );

    await expect(
      canvas.getByRole("button", { name: "End Round" }),
    ).toBeVisible();
  },
};

export const LobbyFinishedPhase: Story = {
  args: {
    mode: "lobby",
    game: sampleGame,
    initialRoom: sampleRoom,
    initialGame: finishedGameState,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    shareUrl: "https://example.com/room/AB12CD",
    onLeave: fn(),
    onRemoved: fn(),
    onStartGame: fn(),
  },
  beforeEach: () => {
    FakeEventSource.instances = [];
    globalThis.EventSource =
      FakeEventSource as unknown as typeof globalThis.EventSource;
    globalThis.fetch = fn().mockResolvedValue({ status: 200 }) as never;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Game Over")).toBeVisible();
    // Firewall office bought round 1 -> 4 points in cyber_defence.
    await expect(canvas.getByText("4 / 16")).toBeVisible();
  },
};
