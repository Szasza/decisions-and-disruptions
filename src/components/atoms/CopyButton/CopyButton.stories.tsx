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

export const ClickedTwice: Story = {
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

    // The first click leaves a pending "reset to Copy" timeout behind.
    // Clicking again before it fires clears that stale timeout and starts a
    // fresh one, rather than leaking it or letting it fire early.
    await userEvent.click(button);
    await expect(await canvas.findByText("Copied!")).toBeVisible();

    await userEvent.click(button);

    await expect(writeText).toHaveBeenCalledTimes(2);
    await expect(writeText).toHaveBeenNthCalledWith(2, args.value);
    await expect(canvas.getByText("Copied!")).toBeVisible();
  },
};

export const ResetsToDefaultLabelAfterDelay: Story = {
  args: {
    value: sampleValue,
  },
  play: async ({ canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Copy" });
    await userEvent.click(button);
    await expect(await canvas.findByText("Copied!")).toBeVisible();

    // The label reverts on its own ~2s later, via the component's real
    // setTimeout — no fake timers here (this Storybook/Vitest browser-mode
    // runner doesn't support mixing them with a real browser event loop, see
    // RoomLobby's stories), so this genuinely waits it out. findByText polls
    // rather than a single fixed-delay check, and its timeout comfortably
    // exceeds the 2000ms the component itself waits.
    await expect(
      await canvas.findByText("Copy", {}, { timeout: 3_000 }),
    ).toBeVisible();
  },
};

export const NoClipboardApi: Story = {
  args: {
    value: sampleValue,
  },
  play: async ({ canvasElement }) => {
    // Simulate an environment without the Clipboard API (e.g. an insecure
    // context, or a browser that never implemented it) rather than a mock
    // writeText — handleClick's `if (navigator.clipboard)` guard should
    // skip its whole body silently, never touching state.
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Copy" });
    await userEvent.click(button);

    await expect(canvas.queryByText("Copied!")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Copy" })).toBeVisible();
  },
};
