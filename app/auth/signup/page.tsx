"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full max-w-[420px]">
    <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <h1 className="font-syne text-[32px] font-extrabold tracking-[-1.5px] leading-[1.05] mb-2 text-cream">
        Create account
      </h1>
      <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
        Build your network in seconds.
      </p>

      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password !== confirm) {
            setError("Passwords don't match.");
            return;
          }
          if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
          }
          setError(null);
          setSubmitting(true);
          try {
            await api.auth.requestOtp(email.trim());
            try {
              sessionStorage.setItem("crowhub:signup:password", password);
              sessionStorage.setItem("crowhub:signup:email", email.trim());
            } catch {}
            router.push(
              `/auth/verify-email?email=${encodeURIComponent(email.trim())}`
            );
          } catch (err) {
            const msg =
              err instanceof ApiError
                ? err.message
                : "Something went wrong. Please try again.";
            setError(msg);
            setSubmitting(false);
          }
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
            Confirm password
          </span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
          />
        </label>

        {error && (
          <div className="text-[12px] text-amber-light px-2">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending code…" : "Create account →"}
        </button>
      </form>

      <p className="mt-7 text-[13px] text-gray-5 text-center">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-cream hover:underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </div>
    </div>
  );
}
