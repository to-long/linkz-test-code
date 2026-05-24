import type { Meta, StoryObj } from "@storybook/react";
import { SeatGrid } from "./seat-grid";

const meta: Meta<typeof SeatGrid> = {
  title: "Components/SeatGrid",
  component: SeatGrid,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof SeatGrid>;

const mockSeats = [
  { id: "1", label: "A1", price: 1500, status: "reserved" as const },
  { id: "2", label: "A2", price: 1500, status: "available" as const },
  { id: "3", label: "A3", price: 1500, status: "reserved" as const },
  { id: "4", label: "A4", price: 1500, status: "available" as const },
  { id: "5", label: "B1", price: 2000, status: "available" as const },
  {
    id: "6",
    label: "B2",
    price: 2000,
    status: "held" as const,
    isMine: true,
  },
  { id: "7", label: "B3", price: 2000, status: "reserved" as const },
  { id: "8", label: "B4", price: 2000, status: "reserved" as const },
  { id: "9", label: "C1", price: 2000, status: "reserved" as const },
  { id: "10", label: "C2", price: 2000, status: "available" as const },
  { id: "11", label: "C3", price: 2000, status: "reserved" as const },
  { id: "12", label: "C4", price: 2000, status: "reserved" as const },
  { id: "13", label: "D1", price: 2500, status: "reserved" as const },
  { id: "14", label: "D2", price: 2500, status: "reserved" as const },
  { id: "15", label: "D3", price: 2500, status: "reserved" as const },
  { id: "16", label: "D4", price: 2500, status: "reserved" as const },
];

export const Default: Story = {
  args: { seats: mockSeats, columns: 4 },
};

export const AllAvailable: Story = {
  args: {
    seats: mockSeats.map((s) => ({ ...s, status: "available" as const })),
    columns: 4,
  },
};

export const FullyBooked: Story = {
  args: {
    seats: mockSeats.map((s) => ({ ...s, status: "reserved" as const })),
    columns: 4,
  },
};
