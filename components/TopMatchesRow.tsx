"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type TopMatchIntent =
  | "networking"
  | "hiring"
  | "referral"
  | "mentorship";

export type TopMatchProfile = {
  id: string;
  name: string;
  emoji: string;
  role: string;
  company: string;
  intent: TopMatchIntent;
  online: boolean;
  mutuals: number;
};

export type YouProfile = {
  name: string;
  avatar: string;
};

const RING: Record<
  TopMatchIntent,
  { from: string; to: string; label: string; soft: string }
> = {
  networking: {
    from: "#7a9ec0",
    to: "#a5c1dd",
    soft: "rgba(122,158,192,0.5)",
    label: "Networking",
  },
  hiring: {
    from: "#e09b45",
    to: "#f2bc6e",
    soft: "rgba(224,155,69,0.5)",
    label: "Hiring",
  },
  referral: {
    from: "#c69b6a",
    to: "#dab68b",
    soft: "rgba(198,155,106,0.45)",
    label: "Referral",
  },
  mentorship: {
    from: "#6aab7a",
    to: "#92c79f",
    soft: "rgba(106,171,122,0.5)",
    label: "Mentorship",
  },
};

export default function TopMatchesRow({
  you,
  matches,
  total,
  onSeeAll,
}: {
  you: YouProfile;
  matches: TopMatchProfile[];
  total?: number;
  onSeeAll?: () => void;
}) {
  const router = useRouter();
  const [peekId, setPeekId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 380);
    return () => window.clearTimeout(t);
  }, []);

  const peek = matches.find((m) => m.id === peekId) ?? null;

  return (
    <section className="relative mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] uppercase tracking-[0.18em] text-gray-5">
          Your top matches
          {typeof total === "number" && total > 0 && (
            <span className="ml-2 text-cream">({total})</span>
          )}
        </span>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[11px] text-gray-5 hover:text-cream transition-colors"
          >
            See all →
          </button>
        )}
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #0a0a0a 10%, transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, #0a0a0a 10%, transparent)",
          }}
        />

        <div className="no-scrollbar overflow-x-auto pb-2">
          <div className="flex gap-5 px-2 pt-2 w-max">
            <YouCircle you={you} />
            {!loaded ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCircle key={i} delay={i * 0.15} />
                ))}
                <div className="self-center pl-2 text-[11px] uppercase tracking-[0.14em] text-gray-5">
                  Finding your flock…
                </div>
              </>
            ) : matches.length > 0 ? (
              matches.map((m) => (
                <MatchCircle
                  key={m.id}
                  match={m}
                  selected={peekId === m.id}
                  onClick={() =>
                    setPeekId((prev) => (prev === m.id ? null : m.id))
                  }
                />
              ))
            ) : (
              <div className="self-center pl-2 text-[12px] text-gray-5">
                No matches yet — start swiping to find your flock.
              </div>
            )}
          </div>
        </div>
      </div>

      {peek && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setPeekId(null)}
            aria-hidden="true"
          />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-30 w-[320px] animate-peek-in">
            <PeekCard
              match={peek}
              onClose={() => setPeekId(null)}
              onChat={() => {
                setPeekId(null);
                router.push(`/chat?with=${peek.id}`);
              }}
              onProfile={() => {
                setPeekId(null);
                router.push("/profile");
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}

/* ============================================================ Circles */

function YouCircle({ you }: { you: YouProfile }) {
  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      className="flex flex-col items-center gap-1.5 group cursor-pointer flex-shrink-0"
    >
      <div className="relative w-[72px] h-[72px] transition-transform duration-150 group-hover:scale-[1.06]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(245,245,240,0.95), rgba(245,245,240,0.35), rgba(245,245,240,0.95))",
          }}
        />
        <div className="absolute inset-[2.5px] rounded-full bg-ink" />
        <div
          className="absolute inset-[5px] rounded-full flex items-center justify-center text-[28px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,245,240,0.06), rgba(36,36,36,0.7))",
          }}
        >
          {you.avatar}
        </div>
      </div>
      <span className="text-[11.5px] text-cream font-medium truncate max-w-[80px]">
        You
      </span>
      <span className="text-[9px] uppercase tracking-[0.14em] text-gray-5">
        Profile
      </span>
    </Link>
  );
}

function MatchCircle({
  match,
  selected,
  onClick,
}: {
  match: TopMatchProfile;
  selected: boolean;
  onClick: () => void;
}) {
  const ring = RING[match.intent];
  const firstName = match.name.split(" ")[0];
  const isActive = match.online;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Preview ${match.name}`}
      aria-expanded={selected}
      className="flex flex-col items-center gap-1.5 group cursor-pointer flex-shrink-0"
    >
      <div className="relative w-[72px] h-[72px] transition-transform duration-150 group-hover:scale-[1.06]">
        {isActive && (
          <div
            aria-hidden="true"
            className="absolute -inset-1 rounded-full animate-match-ring-pulse"
            style={{
              background: `radial-gradient(circle, ${ring.soft} 0%, transparent 65%)`,
              filter: "blur(2px)",
            }}
          />
        )}
        <div
          className={`absolute inset-0 rounded-full ${
            isActive ? "animate-ring-spin" : ""
          }`}
          style={{
            background: `conic-gradient(from 0deg, ${ring.from}, ${ring.to}, ${ring.from}, ${ring.to}, ${ring.from})`,
            opacity: isActive ? 1 : 0.4,
          }}
        />
        <div className="absolute inset-[2.5px] rounded-full bg-ink" />
        <div
          className="absolute inset-[5px] rounded-full flex items-center justify-center text-[28px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.65), rgba(36,36,36,0.85))",
          }}
        >
          {match.emoji}
        </div>
        <div
          aria-hidden="true"
          className="absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] rounded-full border-2 border-ink z-[1]"
          style={{ background: isActive ? "#6aab7a" : "#555" }}
        />
      </div>
      <span className="text-[11.5px] text-cream font-medium truncate max-w-[80px]">
        {firstName}
      </span>
      <span
        className="text-[9px] uppercase tracking-[0.14em]"
        style={{ color: isActive ? ring.from : "#666" }}
      >
        {ring.label}
      </span>
    </button>
  );
}

function SkeletonCircle({ delay }: { delay: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div
        className="w-[72px] h-[72px] rounded-full bg-gray-2 animate-skeleton"
        style={{ animationDelay: `${delay}s` }}
      />
      <div
        className="w-12 h-2 rounded-full bg-gray-2 animate-skeleton"
        style={{ animationDelay: `${delay + 0.1}s` }}
      />
      <div
        className="w-9 h-[6px] rounded-full bg-gray-2 animate-skeleton"
        style={{ animationDelay: `${delay + 0.2}s` }}
      />
    </div>
  );
}

/* ============================================================ Peek card */

function PeekCard({
  match,
  onClose,
  onChat,
  onProfile,
}: {
  match: TopMatchProfile;
  onClose: () => void;
  onChat: () => void;
  onProfile: () => void;
}) {
  const ring = RING[match.intent];
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/95 to-gray-2/90 backdrop-blur-xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{
        boxShadow: `0 16px 50px rgba(0,0,0,0.55), 0 0 28px ${ring.soft}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-gray-5 hover:text-cream hover:bg-white/[0.05] transition-colors"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="relative flex-shrink-0 rounded-full flex items-center justify-center border-[1.5px]"
          style={{
            width: 48,
            height: 48,
            fontSize: 24,
            background: "rgba(10,10,10,0.6)",
            borderColor: ring.from,
            boxShadow: `0 0 0 2px ${ring.from}22, 0 0 16px ${ring.soft}`,
          }}
        >
          <span>{match.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-syne text-[16px] font-bold text-cream tracking-[-0.3px] leading-tight truncate">
            {match.name}
          </div>
          <div className="text-[11.5px] text-gray-5 leading-tight truncate">
            {match.role} at {match.company}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border-[0.5px]"
          style={{ borderColor: `${ring.from}66`, color: ring.from }}
        >
          {ring.label}
        </span>
        <span className="text-[11px] text-gray-5">
          {match.mutuals} mutual{match.mutuals === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onChat}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-cream border-[0.5px] border-white/30 px-3 py-2 rounded-full text-[12.5px] font-medium bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.25)] hover:from-white/30 hover:to-white/10 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
        <button
          type="button"
          onClick={onProfile}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-gray-5 border-[0.5px] border-gray-3 px-3 py-2 rounded-full text-[12.5px] hover:text-cream hover:border-white/20 hover:bg-white/[0.04] transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
