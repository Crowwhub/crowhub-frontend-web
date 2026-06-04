"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

export default function WorkingOnPage() {
  const router = useRouter();
  const [name, setName] = useState("buddy");
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crowhub:name");
      if (saved) setName(saved.split(" ")[0] || saved);
      const raw = localStorage.getItem("crowhub:profile");
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.currentlyWorkingOn === "string") setText(p.currentlyWorkingOn);
      }
    } catch {}
  }, []);

  function persist(value: string) {
    try {
      const raw = localStorage.getItem("crowhub:profile");
      const existing = raw ? JSON.parse(raw) : {};
      const merged = { ...existing, currentlyWorkingOn: value };
      localStorage.setItem("crowhub:profile", JSON.stringify(merged));
    } catch {}
  }

  async function finish(value: string) {
    try {
      await api.me.update({ currentlyWorkingOn: value });
      await api.me.completeOnboarding();
      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login");
        return;
      }
      alert(
        err instanceof ApiError
          ? err.message
          : "Couldn't finish onboarding. Try again."
      );
    }
  }

  async function handleNext() {
    persist(text.trim());
    await finish(text.trim());
  }

  async function handleSkip() {
    persist("");
    await finish("");
  }

  return (
    <div className="w-full max-w-[480px] relative">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-5 text-sm transition-colors hover:text-cream"
          aria-label="Go back"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <OnboardingProgress current={8} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[28px] font-extrabold tracking-[-1.2px] leading-[1.1] mb-3 text-cream inline-block">
          What are you working on, {name}? ⚡
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Optional — a single sentence on what's keeping you busy right now. Helps people start a real conversation.
        </p>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
              Currently working on
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`e.g. Designing the onboarding flow for a fintech app, or learning Rust by building a CLI tool.`}
              rows={3}
              className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-2xl px-5 py-3 text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30 leading-snug font-light resize-y"
            />
            <span className="text-[11px] text-gray-5 font-light">
              You can change this later from your profile.
            </span>
          </label>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99]"
            >
              Finish setup →
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-5 border-[0.5px] border-gray-3 px-5 py-[14px] rounded-full text-[13px] cursor-pointer hover:text-cream hover:border-white/20 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
