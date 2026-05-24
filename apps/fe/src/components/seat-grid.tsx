import { SeatIcon } from "./seat-icon";

type Seat = {
  id: string;
  label: string;
  price: number;
  status: "available" | "held" | "reserved";
  isMine?: boolean;
};

type SeatGridProps = {
  seats: Seat[];
  columns?: number;
  onSelect?: (seatId: string) => void;
  onRelease?: (seatId: string) => void;
};

export function SeatGrid({
  seats,
  columns = 4,
  onSelect,
  onRelease,
}: SeatGridProps) {
  const rows: Seat[][] = [];
  for (let i = 0; i < seats.length; i += columns) {
    rows.push(seats.slice(i, i + columns));
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-4 justify-center">
          {row.map((seat) => (
            <SeatIcon
              key={seat.id}
              label={seat.label}
              price={seat.price}
              status={seat.status}
              isMine={seat.isMine}
              onClick={() => {
                if (seat.isMine) onRelease?.(seat.id);
                else if (seat.status === "available") onSelect?.(seat.id);
              }}
              disabled={seat.status !== "available" && !seat.isMine}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
