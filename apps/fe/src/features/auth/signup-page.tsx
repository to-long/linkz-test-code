import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import * as m from "../../paraglide/messages.js";
import { useLocale } from "../../lib/i18n";
import { AppLayout } from "../../components/app-layout";
import { GoogleSignInButton } from "./google-sign-in-button";

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, setActive } = useSignUp();
  useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) return;
    setError("");
    setLoading(true);

    try {
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");

      const result = await signUp.create({
        firstName,
        lastName: lastName || undefined,
        emailAddress: email,
        password,
      });

      if (result.status === "complete" && setActive) {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        // May need email verification — check result.status
        setError("Please check your email to verify your account.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center bg-[#e8f0ed] dark:bg-[#1e2e25] p-4 sm:p-10">
        <div className="w-full max-w-[440px] bg-white dark:bg-[#2a2a2a] rounded-xl shadow-[0_2px_4px_#00000008,0_12px_32px_#0000000f] border border-[#D6DDD0] dark:border-[#444] p-5 sm:p-9">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-[#1B3A28] dark:text-white mb-4">
            {m.create_account()}
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <GoogleSignInButton />

          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-[#D6DDD0] dark:bg-[#444]" />
            <span className="text-xs text-[#7A9A80] font-sans">
              {m.or()}
            </span>
            <div className="flex-1 h-px bg-[#D6DDD0] dark:bg-[#444]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1B3A28] dark:text-[#d0d0d0] mb-1.5">
                {m.name()}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-3 border border-[#D6DDD0] dark:border-[#444] rounded bg-white dark:bg-[#333] text-[#1B3A28] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5E3A]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1B3A28] dark:text-[#d0d0d0] mb-1.5">
                {m.email()}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-3 border border-[#D6DDD0] dark:border-[#444] rounded bg-white dark:bg-[#333] text-[#1B3A28] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5E3A]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1B3A28] dark:text-[#d0d0d0] mb-1.5">
                {m.password()}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3.5 py-3 border border-[#D6DDD0] dark:border-[#444] rounded bg-white dark:bg-[#333] text-[#1B3A28] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5E3A]"
                placeholder="Min. 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#2D5E3A] text-white rounded text-sm font-semibold hover:bg-[#1B3A28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? m.creating_account() : m.sign_up()}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px]">
            <span className="text-[#7A9A80] font-sans">
              {m.already_have_account()}{" "}
            </span>
            <Link to="/login" className="text-[#2D5E3A] font-semibold hover:underline">
              {m.sign_in()}
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
