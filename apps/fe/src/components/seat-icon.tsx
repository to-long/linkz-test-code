type SeatIconProps = {
  label: string;
  price: number;
  status: "available" | "held" | "reserved";
  isMine?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export function SeatIcon({
  label,
  price,
  status,
  isMine = false,
  onClick,
  disabled,
}: SeatIconProps) {
  let bgColor = "bg-[#D6DDD0] dark:bg-[#3a4a3f]";
  let borderColor = "border-[#C5C5CB] dark:border-[#555]";
  let iconColor = "text-[#7A9A80]";
  let labelColor = "text-[#1B3A28] dark:text-[#d0d0d0]";
  let opacity = "";

  if (isMine) {
    bgColor = "bg-[#2D5E3A]";
    borderColor = "border-[#1B3A28]";
    iconColor = "text-white";
    labelColor = "text-white";
  } else if (status === "available") {
    bgColor = "bg-white dark:bg-[#2a2a2a]";
    borderColor = "border-[#2D5E3A]";
  } else {
    opacity = "opacity-60";
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl border-[1.5px] transition-all ${bgColor} ${borderColor} ${opacity} ${
        status === "available"
          ? "cursor-pointer hover:shadow-md"
          : isMine
            ? "cursor-pointer"
            : "cursor-not-allowed"
      }`}
    >
      <svg
        className={`w-8 h-8 ${iconColor}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
        <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
      </svg>
      <span className={`text-[11px] font-semibold ${labelColor}`}>{label}</span>
      {(status === "available" || isMine) && (
        <span
          className={`text-[10px] font-semibold ${status === "available" ? "text-[#2D5E3A]" : "text-white"}`}
        >
          {formatPrice(price)}
        </span>
      )}
    </button>
  );
}
