import { useNavigate } from "react-router-dom";
import * as m from "../../paraglide/messages.js";
import { useLocale } from "../../lib/i18n";
import { AppLayout } from "../../components/app-layout";

export function PaymentCancel() {
  const navigate = useNavigate();
  useLocale();

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center bg-[#e8f0ed] dark:bg-[#1e2e25] px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] p-5 sm:p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1B3A28] dark:text-white mb-2">
              {m.payment_cancelled()}
            </h2>
            <p className="text-[#7A9A80] mb-6 text-sm">
              {m.payment_cancelled_desc()}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/")}
                className="w-full py-2 px-6 bg-[#2D5E3A] text-white rounded hover:bg-[#1B3A28] transition-colors"
              >
                {m.back_to_seats()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
