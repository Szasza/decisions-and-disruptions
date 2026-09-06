import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Game } from "@/lib/games/types";
import { GameList } from "./GameList";

const meta = {
  title: "Organisms/GameList",
  component: GameList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: { action: fn() },
} satisfies Meta<typeof GameList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleGames: Game[] = [
  {
    id: "decisions-and-disruptions",
    name: "Decisions & Disruptions",
    description:
      "A tabletop cybersecurity decision-making game where players respond to unfolding incidents as a team.",
    minPlayers: 3,
    maxPlayers: 6,
    estimatedMinutes: 90,
  },
  {
    id: "phishing-drill",
    name: "Phishing Drill",
    description: "A quick-fire scenario game about spotting phishing emails.",
    minPlayers: 2,
    maxPlayers: 4,
    estimatedMinutes: 30,
  },
];

export const Default: Story = {
  args: {
    games: sampleGames,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Decisions & Disruptions")).toBeVisible();
    await expect(canvas.getByText("Phishing Drill")).toBeVisible();

    const buttons = canvas.getAllByRole("button", { name: "Create room" });
    await userEvent.click(buttons[1]);

    await expect(args.action).toHaveBeenCalledWith("phishing-drill");
  },
};

export const Empty: Story = {
  args: {
    games: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No games available yet.")).toBeVisible();
  },
};
