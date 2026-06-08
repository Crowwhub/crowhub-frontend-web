"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

type Interest = { label: string; emoji: string };

const INTERESTS: Interest[] = [
  { label: "Frontend Development", emoji: "🎨" },
  { label: "Databases", emoji: "🗄️" },
  { label: "UI/UX Design", emoji: "✨" },
  { label: "AI & Machine Learning", emoji: "🤖" },
  { label: "Full-Stack Development", emoji: "🚀" },
  { label: "Product Strategy", emoji: "🎯" },
  { label: "Design System", emoji: "🧩" },
  { label: "Cloud & DevOps", emoji: "☁️" },
  { label: "Software Engineering", emoji: "⚙️" },
  { label: "APIs & Integrations", emoji: "🔌" },
  { label: "Product Thinking", emoji: "💡" },
  { label: "Backend Systems", emoji: "⚡" },
  { label: "Data & Analytics", emoji: "📊" },
  { label: "Exploring Opportunities", emoji: "🔭" },
  { label: "Networking", emoji: "🤝" },
  { label: "Collaboration", emoji: "🌐" },
  { label: "Mobile Development", emoji: "📱" },
  { label: "Open Source", emoji: "🌱" },
  { label: "Sports", emoji: "⚽" },
  { label: "Anime", emoji: "🍥" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Standup Comedy", emoji: "🎙️" },
  { label: "Music", emoji: "🎵" },
  { label: "Movies & TV", emoji: "🎬" },
  { label: "Travel", emoji: "✈️" },
  { label: "Fitness", emoji: "🏋️" },
  { label: "Reading", emoji: "📚" },
  { label: "Food", emoji: "🍜" },
  { label: "Photography", emoji: "📷" },
  { label: "Startups", emoji: "🚀" },
];

const INTEREST_MAP = new Map(INTERESTS.map((i) => [i.label, i]));

export default function InterestsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const pool = INTERESTS.filter((i) => !selected.includes(i.label));
    if (!q) return pool;
    return pool.filter((i) => i.label.toLowerCase().includes(q));
  }, [query, selected]);

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
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
        <OnboardingProgress current={6} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[28px] font-extrabold tracking-[-1.2px] leading-[1.1] mb-3 text-cream inline-block">
          What are your other interests? ✨
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Choose what aligns with your interests
        </p>

        <div className="flex flex-col gap-5">
          <div className="relative">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-5 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search interests..."
              className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full pl-12 pr-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
            />
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((label) => {
                const item = INTEREST_MAP.get(label);
                if (!item) return null;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggle(label)}
                    aria-label={`Remove ${label}`}
                    className="inline-flex items-center gap-2 text-cream border-[0.5px] border-white/30 px-3.5 py-2 rounded-full text-[13px] bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:from-white/30 hover:to-white/10"
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    {item.label}
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
                );
              })}
            </div>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-gray-5 mb-3">
              {query.trim() ? "Results" : "Popular"}
            </div>
            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-[260px] overflow-y-auto pr-1">
                {suggestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggle(item.label)}
                    className="inline-flex items-center gap-2 text-gray-5 border-[0.5px] border-gray-3 px-3.5 py-2 rounded-full text-[13px] bg-transparent cursor-pointer transition-colors hover:text-cream hover:border-white/20 hover:bg-white/5"
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-gray-4 italic">
                {query.trim()
                  ? `No interests match "${query}".`
                  : "You've selected everything 🎉"}
              </p>
            )}
          </div>

          <div className="text-[11px] text-gray-5 font-light">
            {selected.length} interest{selected.length === 1 ? "" : "s"}{" "}
            selected
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const raw = localStorage.getItem("crowhub:profile");
                const existing = raw ? JSON.parse(raw) : {};
                const merged = { ...existing, interests: selected };
                localStorage.setItem("crowhub:profile", JSON.stringify(merged));
              } catch {}
              try {
                await api.me.update({ interests: selected });
                router.push("/auth/onboarding/goals");
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
            className="w-full text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99]"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
