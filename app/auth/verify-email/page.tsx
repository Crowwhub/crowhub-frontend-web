"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, api, setToken } from "@/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setInterval(() => {
      setResendIn((n) => (n > 0 ? n - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendIn]);

  const code = digits.join("");
  const ready = code.length === 6 && digits.every((d) => d !== "");

  function setDigit(i: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleChange(i: number, v: string) {
    const cleaned = v.replace(/\D/g, "");
    if (cleaned.length === 0) {
      setDigit(i, "");
      return;
    }
    if (cleaned.length === 1) {
      setDigit(i, cleaned);
      if (i < 5) refs.current[i + 1]?.focus();
    } else {
      // multi-char input (e.g. paste fallback) — distribute
      setDigits((prev) => {
        const next = [...prev];
        for (let j = 0; j < cleaned.length && i + j < 6; j++) {
          next[i + j] = cleaned[j];
        }
        return next;
      });
      const last = Math.min(i + cleaned.length - 1, 5);
      refs.current[Math.min(last + 1, 5)]?.focus();
    }
    setError(null);
  }

  function handleKeyDown(
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setDigit(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setDigit(i - 1, "");
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    } else if (e.key === "Enter" && ready) {
      handleVerify();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      for (let j = 0; j < 6; j++) {
        next[j] = pasted[j] ?? "";
      }
      return next;
    });
    refs.current[Math.min(pasted.length, 5)]?.focus();
    setError(null);
  }

  async function handleVerify() {
    if (!ready || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      let password = "";
      try {
        password = sessionStorage.getItem("crowhub:signup:password") ?? "";
      } catch {}
      if (!password) {
        setError("Your session expired. Please sign up again.");
        setVerifying(false);
        return;
      }
      const res = await api.auth.signupVerify({
        email,
        otp: code,
        password,
      });
      setToken(res.token);
      try {
        sessionStorage.removeItem("crowhub:signup:password");
        sessionStorage.removeItem("crowhub:signup:email");
      } catch {}
      router.push("/auth/onboarding");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      setError(msg);
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setResendIn(30);
    setDigits(["", "", "", "", "", ""]);
    refs.current[0]?.focus();
    setError(null);
    try {
      await api.auth.requestOtp(email);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Couldn't resend the code. Try again in a bit.";
      setError(msg);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] text-center">
        <div className="mx-auto w-16 h-16 mb-6 rounded-2xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md border-[0.5px] border-white/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f5f5f0"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </div>

        <h1 className="font-syne text-[28px] font-extrabold tracking-[-1.2px] leading-[1.1] mb-3 text-cream">
          Check your email
        </h1>
        <p className="text-[13.5px] text-gray-5 leading-[1.65] mb-1 font-light">
          We sent a 6-digit code to
        </p>
        <p className="text-[13.5px] text-cream mb-7 font-medium break-all">
          {email || "your inbox"}
        </p>

        <div
          className="flex items-center justify-center gap-2 mb-3"
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${i + 1}`}
              className="w-11 h-12 text-center font-syne text-[20px] font-bold text-cream bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/15 rounded-xl outline-none transition-all focus:border-white/40 focus:bg-white/[0.06] focus:scale-[1.04]"
            />
          ))}
        </div>

        {error && (
          <p className="text-[12px] text-amber-light mb-3 font-medium">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={!ready || verifying}
          className="mt-4 w-full text-cream border-[0.5px] border-white/30 px-5 py-[12px] rounded-full text-[14px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {verifying ? "Verifying…" : "Verify →"}
        </button>

        <div className="mt-5 text-[12.5px] text-gray-5">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendIn > 0}
            className="text-cream hover:underline underline-offset-4 disabled:text-gray-5 disabled:hover:no-underline disabled:cursor-not-allowed font-medium"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>

        <Link
          href="/auth/login"
          className="block mt-6 text-gray-5 text-[12.5px] transition-colors hover:text-cream"
        >
          ← Back to log in
        </Link>
      </div>
    </div>
  );
}
