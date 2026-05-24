export type Seat = {
  id: string;
  label: string;
  price: number;
  status: "available" | "held" | "reserved";
  heldBy: string | null;
  heldUntil: string | null;
  reservedBy: string | null;
};
