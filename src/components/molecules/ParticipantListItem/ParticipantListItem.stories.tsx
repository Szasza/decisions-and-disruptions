import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import type { Participant } from "@/lib/rooms/types";
import { ParticipantListItem } from "./ParticipantListItem";

const meta = {
  title: "Molecules/ParticipantListItem",
  component: ParticipantListItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ParticipantListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleParticipant: Participant = {
  id: "participant-1",
  displayName: "Ada",
  joinedAt: 1000,
  lastSeenAt: 1000,
};

export const CurrentParticipant: Story = {
  args: {
    participant: sampleParticipant,
    isCurrentParticipant: true,
    now: 1000 + 65_000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ada")).toBeVisible();
    await expect(canvas.getByText("(you)")).toBeVisible();
    await expect(canvas.getByText("joined 1m ago")).toBeVisible();
  },
};

export const OtherParticipant: Story = {
  args: {
    participant: {
      ...sampleParticipant,
      id: "participant-2",
      displayName: "Grace",
    },
    isCurrentParticipant: false,
    now: 1000 + 65_000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Grace")).toBeVisible();
    await expect(canvas.queryByText("(you)")).not.toBeInTheDocument();
    await expect(canvas.getByText("joined 1m ago")).toBeVisible();
  },
};
