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

export const FocusSelectsEntireValue: Story = {
  args: {
    url: sampleUrl,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByDisplayValue(sampleUrl) as HTMLInputElement;

    // Focusing the read-only input should select its whole value, so a user
    // can copy it with a keyboard shortcut immediately, without needing to
    // manually drag-select the text first. A direct `.focus()` call (rather
    // than a simulated mouse click) is used deliberately: clicking would
    // also fire a native mouseup that repositions the caret to the click
    // point, immediately collapsing the selection this handler just made —
    // a real browser quirk unrelated to the onFocus handler under test.
    input.focus();

    await expect(input.selectionStart).toBe(0);
    await expect(input.selectionEnd).toBe(sampleUrl.length);
  },
};
