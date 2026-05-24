import type { Meta, StoryObj } from "@storybook/react";
import { BookingSummary } from "./booking-summary";

const meta: Meta<typeof BookingSummary> = {
  title: "Components/BookingSummary",
  component: BookingSummary,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof BookingSummary>;

export const NoSelection: Story = {
  args: { availableCount: 3, totalPrice: 0, hasSelection: false },
};

export const WithSelection: Story = {
  args: { availableCount: 2, totalPrice: 3500, hasSelection: true },
};

export const SingleSeat: Story = {
  args: { availableCount: 5, totalPrice: 2000, hasSelection: true },
};
