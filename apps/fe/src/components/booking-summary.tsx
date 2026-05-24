type BookingSummaryProps = {
  availableCount: number;
  totalPrice: number;
  hasSelection: boolean;
  onConfirm?: () => void;
};

export function BookingSummary({
  availableCount,
  totalPrice,
  hasSelection,
  onConfirm,
}: BookingSummaryProps) {
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  return (
    <div className="w-full flex items-center justify-between bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] py-4 px-6 gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[#1B3A28] dark:text-white">
          {availableCount} seats available
        </span>
        <span className="text-xs text-[#7A9A80]">
          Select up to 4 seats per booking
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-[#1B3A28] dark:text-white">
          {formatPrice(totalPrice)}
        </span>
        {hasSelection && (
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 bg-[#2D5E3A] text-white text-sm font-semibold px-6 py-3 rounded hover:bg-[#1B3A28] transition-colors"
          >
            Confirm Booking
          </button>
        )}
      </div>
    </div>
  );
}
