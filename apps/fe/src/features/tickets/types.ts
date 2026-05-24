export type Ticket = {
  id: string;
  seatLabels: string[];
  eventName: string;
  date: string;
  time: string;
  totalAmount: number;
  status: "upcoming" | "past";
};

export type Tab = "upcoming" | "past" | "all";
