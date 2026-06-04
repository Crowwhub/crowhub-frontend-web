"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

type Tag = { label: string; emoji: string };

const DOMAIN_TAGS: Record<string, Tag[]> = {
  "Software Developer": [
    { label: "Leetcode partner", emoji: "🧩" },
    { label: "Open source collab", emoji: "🌱" },
    { label: "Hackathon teammate", emoji: "⚡" },
    { label: "Code review buddy", emoji: "👀" },
    { label: "Tech interview prep", emoji: "💼" },
    { label: "System design study group", emoji: "🧠" },
  ],
  "Data Analyst": [
    { label: "Kaggle teammate", emoji: "📊" },
    { label: "ML study partner", emoji: "🤖" },
    { label: "SQL puzzles", emoji: "🧮" },
    { label: "Data viz critique", emoji: "📈" },
    { label: "Stats discussion", emoji: "📐" },
  ],
  Designer: [
    { label: "Design critique", emoji: "🎨" },
    { label: "Portfolio reviewer", emoji: "📁" },
    { label: "Branding collab", emoji: "✨" },
    { label: "Dribbble buddy", emoji: "🏀" },
    { label: "Daily UI partner", emoji: "🗓️" },
  ],
  "Product Manager": [
    { label: "Strategy buddy", emoji: "🎯" },
    { label: "Product critique", emoji: "🔍" },
    { label: "PM study group", emoji: "📚" },
    { label: "Discovery interviews", emoji: "🎤" },
  ],
  Writer: [
    { label: "Writing partner", emoji: "✍️" },
    { label: "Editing buddy", emoji: "📝" },
    { label: "Newsletter collab", emoji: "📰" },
    { label: "Pitch swap", emoji: "📨" },
    { label: "Book club", emoji: "📖" },
  ],
  Photographer: [
    { label: "Shoot collaborator", emoji: "📷" },
    { label: "Editing critique", emoji: "🖼️" },
    { label: "Photo walk buddy", emoji: "🚶" },
    { label: "Travel shoot", emoji: "🌄" },
  ],
  Singer: [
    { label: "Vocal duet", emoji: "🎤" },
    { label: "Songwriting partner", emoji: "🎵" },
    { label: "Open mic buddy", emoji: "🎙️" },
    { label: "Cover collab", emoji: "🎧" },
  ],
  Musician: [
    { label: "Band member", emoji: "🎸" },
    { label: "Jam buddy", emoji: "🎹" },
    { label: "Producer collab", emoji: "🎛️" },
    { label: "Co-writer", emoji: "🎼" },
  ],
  Artist: [
    { label: "Art collab", emoji: "🎨" },
    { label: "Studio buddy", emoji: "🖌️" },
    { label: "Exhibition partner", emoji: "🖼️" },
    { label: "Sketch group", emoji: "✏️" },
  ],
  Filmmaker: [
    { label: "Film collaborator", emoji: "🎬" },
    { label: "Script reader", emoji: "📜" },
    { label: "Festival circuit", emoji: "🎞️" },
    { label: "DoP / editor pair", emoji: "🎥" },
  ],
  Entrepreneur: [
    { label: "Co-founder", emoji: "🚀" },
    { label: "Investor intro", emoji: "💰" },
    { label: "Customer interview swap", emoji: "🤝" },
    { label: "Founder accountability", emoji: "📌" },
  ],
  "Marketing Professional": [
    { label: "Growth experiments", emoji: "📈" },
    { label: "Ad copy critique", emoji: "✏️" },
    { label: "Campaign brainstorm", emoji: "💡" },
    { label: "SEO swap", emoji: "🔎" },
  ],
  Educator: [
    { label: "Teaching collab", emoji: "👩‍🏫" },
    { label: "Curriculum buddy", emoji: "📚" },
    { label: "Workshop co-host", emoji: "🎤" },
  ],
  Researcher: [
    { label: "Research buddy", emoji: "🔬" },
    { label: "Paper review", emoji: "📄" },
    { label: "Conference co-author", emoji: "🤝" },
  ],
};

const UNIVERSAL_TAGS: Tag[] = [
  { label: "Networking", emoji: "🤝" },
  { label: "Hire me", emoji: "💼" },
  { label: "Referral", emoji: "🎯" },
  { label: "Project Collab", emoji: "🧩" },
  { label: "Co-founder", emoji: "🚀" },
  { label: "Mentor", emoji: "🧭" },
  { label: "Mentee", emoji: "🌱" },
  { label: "Coffee chat", emoji: "☕" },
  { label: "Networking buddy", emoji: "🤝" },
  { label: "Side project partner", emoji: "🛠️" },
  { label: "Travel buddy", emoji: "✈️" },
  { label: "Gym partner", emoji: "🏋️" },
  { label: "Valorant partner", emoji: "🎮" },
  { label: "Matiks squad", emoji: "🔢" },
  { label: "Chess opponent", emoji: "♟️" },
  { label: "Reading group", emoji: "📖" },
  { label: "Just to chat", emoji: "💬" },
];

export default function FindMeForPage() {
  const router = useRouter();
  const [name, setName] = useState("buddy");
  const [domain, setDomain] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crowhub:name");
      if (saved) setName(saved.split(" ")[0] || saved);
      const raw = localStorage.getItem("crowhub:profile");
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.domain === "string") setDomain(p.domain);
        if (Array.isArray(p.findMeFor)) setSelected(p.findMeFor);
      }
    } catch {}
  }, []);

  const domainTags = useMemo<Tag[]>(
    () => DOMAIN_TAGS[domain] ?? [],
    [domain]
  );

  // Universal options excluding any already present in domain group (dedupe by label).
  const universalTags = useMemo<Tag[]>(() => {
    const domainLabels = new Set(domainTags.map((t) => t.label));
    return UNIVERSAL_TAGS.filter((t) => !domainLabels.has(t.label));
  }, [domainTags]);

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  function persist(value: string[]) {
    try {
      const raw = localStorage.getItem("crowhub:profile");
      const existing = raw ? JSON.parse(raw) : {};
      const merged = { ...existing, findMeFor: value };
      localStorage.setItem("crowhub:profile", JSON.stringify(merged));
    } catch {}
  }

  async function pushWith(value: string[]) {
    try {
      await api.me.update({ findMeFor: value });
      router.push("/auth/onboarding/interests");
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

  const MIN_SELECTIONS = 5;
  const canContinue = selected.length >= MIN_SELECTIONS;
  const remaining = Math.max(0, MIN_SELECTIONS - selected.length);

  async function handleNext() {
    if (!canContinue) return;
    persist(selected);
    await pushWith(selected);
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
        <OnboardingProgress current={5} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[26px] font-extrabold tracking-[-1.1px] leading-[1.15] mb-3 text-cream inline-block">
          People can find you for, {name}?
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Pick at least {MIN_SELECTIONS} things you're up for — these are how others will find you.
        </p>

        <div className="flex flex-col gap-6">
          {domainTags.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5">
                Based on your domain · <span className="text-cream">{domain}</span>
              </div>
              <ChipGrid tags={domainTags} selected={selected} onToggle={toggle} />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5">
              {domainTags.length > 0 ? "Or these" : "Pick what fits"}
            </div>
            <ChipGrid tags={universalTags} selected={selected} onToggle={toggle} />
          </div>

          <div className="text-[11px] text-gray-5 font-light">
            {selected.length} selected
            {!canContinue && (
              <span className="text-cream">
                {" "}
                · pick {remaining} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="flex-1 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-white/25 disabled:hover:to-white/10 disabled:hover:scale-100"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipGrid({
  tags,
  selected,
  onToggle,
}: {
  tags: Tag[];
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const isOn = selected.includes(t.label);
        return (
          <button
            key={t.label}
            type="button"
            onClick={() => onToggle(t.label)}
            aria-pressed={isOn}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] border-[0.5px] transition-all cursor-pointer ${
              isOn
                ? "text-cream border-white/30 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-white/30 hover:to-white/10"
                : "text-gray-5 border-gray-3 bg-transparent hover:text-cream hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <span aria-hidden="true">{t.emoji}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
