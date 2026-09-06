import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DisplayNameForm } from "./DisplayNameForm";

const meta = {
  title: "Molecules/DisplayNameForm",
  component: DisplayNameForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { action: fn() },
} satisfies Meta<typeof DisplayNameForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptySubmitIsBlocked: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Join room" });

    await userEvent.click(button);

    await expect(args.action).not.toHaveBeenCalled();
    await expect(await canvas.findByText("Enter a display name")).toBeVisible();
  },
};

export const ValidSubmission: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Display name");
    const button = canvas.getByRole("button", { name: "Join room" });

    await userEvent.type(input, "Ada");
    await userEvent.click(button);

    await expect(args.action).toHaveBeenCalledWith("Ada");
  },
};

export const WithInitialError: Story = {
  args: {
    initialError: "That name is already taken",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("That name is already taken"),
    ).toBeVisible();
  },
};
