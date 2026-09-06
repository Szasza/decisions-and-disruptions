import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Game } from "@/lib/games/types";
import { GameCard } from "./GameCard";

const meta = {
  title: "Molecules/GameCard",
  component: GameCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onSelect: fn() },
} satisfies Meta<typeof GameCard>;

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
    await expect(canvas.getByText("3–6 players")).toBeVisible();
    await expect(canvas.getByText("~90 min")).toBeVisible();

    const button = canvas.getByRole("button", { name: "Create room" });
    await userEvent.click(button);
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: {
    game: sampleGame,
    disabled: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Create room" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const NoMeta: Story = {
  args: {
    game: {
      id: "no-meta-game",
      name: "Mystery Game",
      description: "A game with no player count or duration metadata.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Mystery Game")).toBeVisible();
  },
};

export const MinPlayersOnly: Story = {
  args: {
    game: {
      id: "min-only-game",
      name: "Open-Ended Game",
      description: "A game with only a minimum player count set.",
      minPlayers: 3,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 players")).toBeVisible();
  },
};

export const MaxPlayersOnly: Story = {
  args: {
    game: {
      id: "max-only-game",
      name: "Capped Game",
      description: "A game with only a maximum player count set.",
      maxPlayers: 6,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("6 players")).toBeVisible();
  },
};

export const EqualMinAndMaxPlayers: Story = {
  args: {
    game: {
      id: "fixed-count-game",
      name: "Fixed-Size Game",
      description: "A game that always requires exactly four players.",
      minPlayers: 4,
      maxPlayers: 4,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Equal min/max collapses to a single count rather than "4–4 players".
    await expect(canvas.getByText("4 players")).toBeVisible();
  },
};
