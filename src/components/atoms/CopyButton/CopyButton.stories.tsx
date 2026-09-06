import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { CopyButton } from "./CopyButton";

const meta = {
  title: "Atoms/CopyButton",
  component: CopyButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleValue = "https://example.com/room/ABCD";

export const Default: Story = {
  args: {
    value: sampleValue,
  },
  play: async ({ args, canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Copy" });
    await userEvent.click(button);

    await expect(writeText).toHaveBeenCalledWith(args.value);
    await expect(await canvas.findByText("Copied!")).toBeVisible();
  },
};
