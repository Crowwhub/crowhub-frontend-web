"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

const POPULAR_GOALS = [
  "Land a job at FAANG",
  "Land a job at Mangos",
  "Compose original music",
  "Build a profitable side project",
  "Join a top design studio",
  "Travel and work remotely",
  "Publish a book",
  "Start my own company",
  "Learn machine learning",
  "Speak at a conference",
  "Become a full-time freelancer",
  "Make my first $100k",
  "Get featured in Wired",
];

export default function GoalsPage() {
  const router = useRouter();
  const [name, setName] = useState("buddy");
  const [customGoal, setCustomGoal] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crowhub:name");
      if (saved) setName(saved.split(" ")[0] || saved);
      const raw = localStorage.getItem("crowhub:profile");
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.goals)) setGoals(p.goals);
      }
    } catch {}
  }, []);

  function addGoal(g: string) {
    const cleaned = g.trim();
    if (!cleaned || goals.includes(cleaned)) return;
    setGoals((prev) => [...prev, cleaned]);
  }
  function removeGoal(g: string) {
    setGoals((prev) => prev.filter((x) => x !== g));
  }
  function addCustom() {
    if (customGoal.trim()) {
      addGoal(customGoal);
      setCustomGoal("");
    }
  }

  function persist(value: string[]) {
    try {
      const raw = localStorage.getItem("crowhub:profile");
      const existing = raw ? JSON.parse(raw) : {};
      const merged = { ...existing, goals: value };
      localStorage.setItem("crowhub:profile", JSON.stringify(merged));
    } catch {}
  }

  async function proceed() {
    persist(goals);
    try {
      await api.me.update({ goals });
      router.push("/auth/onboarding/working-on");
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
  }

  function handleNext() {
    if (goals.length > 0) {
      setPopup(true);
    } else {
      proceed();
    }
  }

  async function handleSkip() {
    persist([]);
    setGoals([]);
    try {
      await api.me.update({ goals: [] });
    } catch {}
    router.push("/auth/onboarding/working-on");
  }

  const filteredPopular = POPULAR_GOALS.filter((g) => !goals.includes(g));

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
        <OnboardingProgress current={7} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[28px] font-extrabold tracking-[-1.2px] leading-[1.1] mb-3 text-cream inline-block">
          What's your goal, {name}? 🚀
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Optional — but the flock connects faster when they know what you're chasing.
        </p>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
              Your goals
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Type a goal and hit enter"
                className="flex-1 bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!customGoal.trim()}
                className="text-cream border-[0.5px] border-white/30 px-5 py-[11px] rounded-full text-[13px] font-medium cursor-pointer bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md hover:from-white/30 hover:to-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {goals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => removeGoal(g)}
                    aria-label={`Remove ${g}`}
                    className="inline-flex items-center gap-1.5 text-cream border-[0.5px] border-white/30 px-3 py-1.5 rounded-full text-[12px] bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-white/30 hover:to-white/10 transition-all"
                  >
                    {g}
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {filteredPopular.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2 mt-1">
                  Popular goals
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filteredPopular.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => addGoal(g)}
                      className="inline-flex items-center gap-1 text-gray-5 border-[0.5px] border-gray-3 px-3 py-1.5 rounded-full text-[12px] hover:text-cream hover:border-white/20 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-gray-4">+</span> {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99]"
            >
              Next →
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

      {popup && (
        <AppreciationPopup
          name={name}
          count={goals.length}
          onClose={() => {
            setPopup(false);
            proceed();
          }}
        />
      )}
    </div>
  );
}

function AppreciationPopup({
  name,
  count,
  onClose,
}: {
  name: string;
  count: number;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-ink/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] rounded-3xl border-[0.5px] border-white/20 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl p-10 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(106,171,122,0.32), 0 0 120px rgba(224,155,69,0.20)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(106,171,122,0.24) 0%, rgba(224,155,69,0.14) 50%, transparent 80%)",
          }}
        />
        <div className="relative">
          <div className="text-[72px] mb-5 inline-block animate-icon-glow">
            🌟
          </div>
          <h2 className="font-syne text-[26px] font-extrabold text-cream mb-3 tracking-[-0.6px] leading-tight animate-text-glow">
            Buddy, you've got goals!
          </h2>
          <p className="text-[14px] text-gray-5 leading-[1.6] mb-7 font-light max-w-[340px] mx-auto">
            {count === 1
              ? `One goal already. Ambition looks good on you, ${name}. Let's go find your flock.`
              : `${count} goals locked in. Ambition looks good on you, ${name}. Let's go find your flock and make them happen.`}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-cream border-[0.5px] border-white/30 px-6 py-3 rounded-full text-[14px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] hover:from-white/35 hover:to-white/15 transition-all"
          >
            Let's go →
          </button>
        </div>
      </div>
    </div>
  );
}
