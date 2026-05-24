import type { Meta, StoryObj } from "@storybook/react";
import { SeatIcon } from "./seat-icon";

const meta: Meta<typeof SeatIcon> = {
  title: "Components/SeatIcon",
  component: SeatIcon,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof SeatIcon>;

export const Available: Story = {
  args: { label: "A1", price: 1500, status: "available" },
};

export const HeldByMe: Story = {
  args: { label: "B2", price: 2000, status: "held", isMine: true },
};

export const Reserved: Story = {
  args: { label: "C3", price: 2000, status: "reserved" },
};

export const Occupied: Story = {
  args: {
    label: "D4",
    price: 2500,
    status: "held",
    isMine: false,
    disabled: true,
  },
};
