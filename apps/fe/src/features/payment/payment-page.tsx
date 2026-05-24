import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as m from "../../paraglide/messages.js";
import { useLocale } from "../../lib/i18n";
import { api } from "../../lib/api";
import { AppLayout } from "../../components/app-layout";

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useLocale();
  const [error, setError] = useState("");

  const seatIds: string[] | undefined = location.state?.seatIds;

  useEffect(() => {
    if (!seatIds || seatIds.length === 0) {
      navigate("/", { replace: true });
      return;
    }

    async function redirectToStripe() {
      try {
        const { checkoutUrl } = await api.createPayment(seatIds!);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setError("Failed to create checkout session");
        }
      } catch (err: any) {
        setError(err.message);
      }
    }

    redirectToStripe();
  }, [seatIds, navigate]);

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center bg-[#e8f0ed] dark:bg-[#1e2e25] px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] p-5 sm:p-8">
          {!error && (
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#2D5E3A] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[#1B3A28] dark:text-white font-medium">
                {m.redirecting_to_stripe()}
              </p>
              <p className="text-sm text-[#7A9A80] mt-1">
                {m.secure_payment_redirect()}
              </p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                {m.payment_error()}
              </h2>
              <p className="text-[#7A9A80] mb-6">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="py-2 px-6 bg-[#2D5E3A] text-white rounded hover:bg-[#1B3A28] transition-colors"
              >
                {m.back_to_seats()}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
