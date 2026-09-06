import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Game } from "@/lib/games/types";
import { GamePortalTemplate } from "./GamePortalTemplate";

const meta = {
  title: "Templates/GamePortalTemplate",
  component: GamePortalTemplate,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: { action: fn() },
} satisfies Meta<typeof GamePortalTemplate>;

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
    await expect(canvas.getByText("Choose a game")).toBeVisible();
    await expect(canvas.getByText("Decisions & Disruptions")).toBeVisible();

    const buttons = canvas.getAllByRole("button", { name: "Create room" });
    await userEvent.click(buttons[0]);

    await expect(args.action).toHaveBeenCalledWith("decisions-and-disruptions");
  },
};
