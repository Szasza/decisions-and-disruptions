import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Display name",
    placeholder: "Enter your name",
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Display name");
    await userEvent.type(input, "Ada");
    await expect(args.onChange).toHaveBeenLastCalledWith("Ada");
  },
};

export const WithError: Story = {
  args: {
    label: "Display name",
    defaultValue: "",
    error: "Name is required",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Display name");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByText("Name is required")).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    label: "Display name",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Display name");
    await expect(input).toBeDisabled();
  },
};
