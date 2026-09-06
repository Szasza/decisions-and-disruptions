import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

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

export const Lobby: Story = {
  args: {
    mode: "lobby",
    game: sampleGame,
    initialRoom: sampleRoom,
    roomCode: sampleRoom.code,
    currentParticipantId: "participant-1",
    shareUrl: "https://example.com/room/AB12CD",
    onLeave: fn(),
    onRemoved: fn(),
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
    await expect(
      canvas.getByDisplayValue("https://example.com/room/AB12CD"),
    ).toBeVisible();
  },
};
