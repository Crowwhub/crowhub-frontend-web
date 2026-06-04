"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

type Avatar = {
  id: string;
  emoji: string;
  bg: string;
  ring: string;
};

const avatars: Avatar[] = [
  { id: "crow", emoji: "🐦‍⬛", bg: "linear-gradient(135deg,#1e2e22,#0f1a13)", ring: "#6aab7a" },
  { id: "owl", emoji: "🦉", bg: "linear-gradient(135deg,#2c1f0e,#1a1208)", ring: "#e09b45" },
  { id: "eagle", emoji: "🦅", bg: "linear-gradient(135deg,#1e2e22,#0f1a13)", ring: "#6aab7a" },
  { id: "penguin", emoji: "🐧", bg: "linear-gradient(135deg,#242424,#101010)", ring: "#aaaaaa" },
  { id: "duck", emoji: "🦆", bg: "linear-gradient(135deg,#2c1f0e,#1a1208)", ring: "#e09b45" },
  { id: "swan", emoji: "🦢", bg: "linear-gradient(135deg,#1e2e22,#0f1a13)", ring: "#6aab7a" },
  { id: "parrot", emoji: "🦜", bg: "linear-gradient(135deg,#2c1f0e,#1a1208)", ring: "#e09b45" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<string>(avatars[0].id);

  const selected = avatars.find((a) => a.id === selectedId) ?? avatars[0];

  return (
    <div className="w-full max-w-[480px] relative">
      <div
        aria-hidden="true"
        className="pointer-events-none hidden md:block absolute -top-[120px] -left-[60px] z-10"
      >
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full border-[0.5px] border-white/20 backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_6px_18px_rgba(0,0,0,0.4)]"
            style={{ background: "linear-gradient(135deg,#1e2e22,#2c1f0e)" }}
          >
            <span className="text-xl">🐦‍⬛</span>
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-[0.5px] border-white/15"
            style={{ background: "linear-gradient(135deg,#1e2e22,#2c1f0e)" }}
          />
          <div
            className="absolute -bottom-3 -right-3 w-1.5 h-1.5 rounded-full border-[0.5px] border-white/10"
            style={{ background: "linear-gradient(135deg,#1e2e22,#2c1f0e)" }}
          />
        </div>
      </div>

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
        <OnboardingProgress current={1} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[30px] font-extrabold tracking-[-1.3px] leading-[1.1] mb-3 text-cream inline-block">
          Let's set up your profile{" "}
          <span className="inline-block align-middle">😊</span>
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Add your name and photo so people can recognize you
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              localStorage.setItem("crowhub:name", name.trim());
              localStorage.setItem("crowhub:avatar", selected.emoji);
            } catch {}
            try {
              await api.me.update({
                name: name.trim(),
                avatar: selected.emoji,
              });
              router.push("/auth/onboarding/personal");
            } catch (err) {
              if (err instanceof ApiError && err.status === 401) {
                router.push("/auth/login");
                return;
              }
              alert(
                err instanceof ApiError
                  ? err.message
                  : "Couldn't save. Try again."
              );
            }
          }}
          className="flex flex-col gap-7"
        >
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
              Enter Full Name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
            />
          </label>

          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
                Set Your Avatar
              </span>
              <InfoIcon />
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-[72px] h-[72px] rounded-full flex-shrink-0 flex items-center justify-center text-[34px] border-[0.5px] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(0,0,0,0.35)] transition-all duration-200"
                style={{
                  background: selected.bg,
                  borderColor: selected.ring,
                  boxShadow: `0 0 0 2px ${selected.ring}33, inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 18px rgba(0,0,0,0.35)`,
                }}
              >
                <span>{selected.emoji}</span>
              </div>

              <div className="flex flex-wrap gap-2 flex-1">
                {avatars.map((a) => {
                  const isSelected = a.id === selectedId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      aria-label={`Select ${a.id} avatar`}
                      aria-pressed={isSelected}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] border-[0.5px] transition-all duration-150 hover:scale-110"
                      style={{
                        background: a.bg,
                        borderColor: isSelected ? a.ring : "rgba(255,255,255,0.1)",
                        boxShadow: isSelected
                          ? `0 0 0 2px ${a.ring}, inset 0 1px 0 rgba(255,255,255,0.12)`
                          : "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      <span>{a.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99]"
          >
            Next →
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-gray-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="More info"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
