"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.auth.login({
        email: email.trim(),
        password,
      });
      setToken(res.token);
      // Fetch profile to know whether to go to onboarding or home.
      try {
        const me = await api.me.get();
        if (me.name) {
          try {
            localStorage.setItem("crowhub:name", me.name);
          } catch {}
        }
        if (me.avatar) {
          try {
            localStorage.setItem("crowhub:avatar", me.avatar);
          } catch {}
        }
        router.push(me.onboardingComplete ? "/home" : "/auth/onboarding");
      } catch {
        router.push("/auth/onboarding");
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Couldn't log you in. Try again.";
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[32px] font-extrabold tracking-[-1.5px] leading-[1.05] mb-2 text-cream">
          Welcome back
        </h1>
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Log in to continue to your flock.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              placeholder="••••••••"
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
            {submitting ? "Signing in…" : "Log in →"}
          </button>
        </form>

        <p className="mt-7 text-[13px] text-gray-5 text-center">
          New here?{" "}
          <Link
            href="/auth/signup"
            className="text-cream hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
