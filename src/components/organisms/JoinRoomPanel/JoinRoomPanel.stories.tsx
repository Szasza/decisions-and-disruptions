import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Game } from "@/lib/games/types";
import { JoinRoomPanel } from "./JoinRoomPanel";

const meta = {
  title: "Organisms/JoinRoomPanel",
  component: JoinRoomPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { action: fn() },
} satisfies Meta<typeof JoinRoomPanel>;

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

export const Default: Story = {
  args: {
    game: sampleGame,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Decisions & Disruptions")).toBeVisible();

    const input = canvas.getByLabelText("Display name");
    const button = canvas.getByRole("button", { name: "Join room" });

    await userEvent.type(input, "Ada");
    await userEvent.click(button);

    await expect(args.action).toHaveBeenCalledWith("Ada");
  },
};

export const WithError: Story = {
  args: {
    game: sampleGame,
    error: "That name is already taken",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("That name is already taken"),
    ).toBeVisible();
  },
};
