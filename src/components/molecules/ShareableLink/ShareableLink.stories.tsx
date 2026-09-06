import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ShareableLink } from "./ShareableLink";

const meta = {
  title: "Molecules/ShareableLink",
  component: ShareableLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShareableLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUrl = "https://example.com/room/AB12CD";

export const Default: Story = {
  args: {
    url: sampleUrl,
  },
  play: async ({ canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue(sampleUrl)).toBeVisible();

    const button = canvas.getByRole("button", { name: "Copy" });
    await userEvent.click(button);

    await expect(writeText).toHaveBeenCalledWith(sampleUrl);
    await expect(await canvas.findByText("Copied!")).toBeVisible();
  },
};
