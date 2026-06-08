"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LikeHeart from "@/components/LikeHeart";
import { api, ApiError, type MatchRecord, type PublicUser } from "@/lib/api";
import { useProfileLikes } from "@/lib/useProfileLikes";
import { intentLabel } from "@/lib/intentLabel";

const LIKE_ACCENT = "#6aab7a";

/* ============================================================ Types & data */

type Intent = string;
type Accent = "sage" | "amber";

type Match = {
  id: string;
  matchId: string;
  name: string;
  emoji: string;
  accent: Accent;
  role: string;
  company: string;
  intent: Intent;
  activity: number;
  user: PublicUser;
};

function toMatch(m: MatchRecord): Match {
  const u = m.user;
  const accent: Accent = u.id.charCodeAt(0) % 2 === 0 ? "sage" : "amber";
  return {
    id: u.id,
    matchId: m.matchId,
    name: u.name ?? u.username,
    emoji: u.avatar ?? "🐦‍⬛",
    accent,
    role: u.role ?? "",
    company: u.location ?? "",
    intent: m.intent ?? "",
    activity: 0,
    user: u,
  };
}

const ACCENT_HEX: Record<Accent, string> = {
  sage: "#6aab7a",
  amber: "#e09b45",
};


const INTENT_OPTIONS: { value: Intent; label: string }[] = [
  { value: "Project Collab", label: "Project Collab" },
  { value: "Hiring", label: "Hiring" },
  { value: "Referral", label: "Referral" },
  { value: "Networking", label: "Networking" },
];

type SortKey = "recent" | "alphabetical" | "active";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "active", label: "Most Active" },
];

/* ============================================================ Page */

export default function MatchesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [intent, setIntent] = useState<Intent | "">("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [requests, setRequests] = useState<number>(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openMatch, setOpenMatch] = useState<Match | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.matches.list();
        if (!cancelled) {
          const mapped = data.map(toMatch);
          setMatches(mapped);
          setLoadError(null);
          // Auto-open a match's profile when arriving via /matches?open=<userId>
          // (e.g. "View Profile" from the home top-matches row).
          try {
            const openId = new URLSearchParams(window.location.search).get(
              "open",
            );
            if (openId) {
              const found = mapped.find((m) => m.id === openId);
              if (found) setOpenMatch(found);
            }
          } catch {}
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "Couldn't load matches."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function refresh() {
      try {
        const c = Number(localStorage.getItem("crowhub:requests:pending"));
        setRequests(Number.isFinite(c) && c > 0 ? c : 0);
      } catch {}
    }
    refresh();
    window.addEventListener("crowhub:requests-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("crowhub:requests-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = matches.filter((m) => {
      if (intent && m.intent !== intent) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sort === "alphabetical") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "active") {
      list = [...list].sort((a, b) => b.activity - a.activity);
    }
    return list;
  }, [matches, search, intent, sort]);

  const hasSearch = search.trim().length > 0;
  const hasFilter = !!intent || sort !== "recent";

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-[10%] right-[12%] w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.12] animate-blob-1"
          style={{
            background: "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[12%] left-[24%] w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.10] animate-blob-2"
          style={{
            background: "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="md:pl-[260px]">
        <div className="px-8 pt-12 pb-20 max-w-[860px]">
          {/* Header */}
          <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
            <div>
              <h1 className="font-syne text-[36px] font-extrabold tracking-[-1.4px] text-cream leading-none">
                Talk to Your Connections 🤩
              </h1>
              <p className="text-[13px] text-gray-5 mt-3 font-light">
                Catch up and start meaningful conversations.
              </p>
            </div>
            <div className="relative w-full sm:w-[300px]">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-5 pointer-events-none"
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for matches..."
                className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full pl-11 pr-5 py-2.5 text-cream text-[13px] outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
              />
            </div>
          </div>

          {/* Filter bar */}
          <div className="relative z-30 flex items-center justify-between gap-3 mb-6 p-3 rounded-2xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <PillButton
                active={!intent}
                onClick={() => setIntent("")}
              >
                All
              </PillButton>
              <FilterDropdown
                label="Select Intent"
                value={intent}
                options={INTENT_OPTIONS}
                onChange={(v) => setIntent(v as Intent | "")}
                allowClear
              />
              <div className="w-px h-5 bg-[#222] mx-1" />
              <FilterDropdown
                label="Sort By"
                value={sort}
                options={SORT_OPTIONS}
                onChange={(v) => setSort(v as SortKey)}
              />
            </div>

            <button
              type="button"
              onClick={() => router.push("/notifications?tab=requests")}
              className="relative inline-flex items-center gap-2 text-cream border-[0.5px] border-white/25 px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_12px_rgba(0,0,0,0.25)] hover:from-white/25 hover:to-white/10 transition-all"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Requests
              {requests > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-cream border-[0.5px] border-ink"
                  style={{
                    background:
                      "linear-gradient(180deg, #e95d5d 0%, #c43c3c 100%)",
                    boxShadow: "0 2px 6px rgba(228,80,80,0.35)",
                  }}
                >
                  {requests > 99 ? "99+" : requests}
                </span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="relative z-10 rounded-2xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md overflow-hidden">
            {loading ? (
              <EmptyState
                title="Loading matches…"
                sub="Fetching the people you've connected with."
              />
            ) : loadError ? (
              <EmptyState
                title="Couldn't load matches"
                sub={loadError}
              />
            ) : filtered.length === 0 ? (
              hasSearch ? (
                <EmptyState
                  title="No matches found"
                  sub="Try a different name or filter."
                />
              ) : (
                <EmptyState
                  title="No crows here yet"
                  sub="Your matches will appear here once you connect."
                  actionLabel="Discover people →"
                  onAction={() => router.push("/home")}
                />
              )
            ) : (
              <ul className="flex flex-col">
                {filtered.map((m, idx) => (
                  <li
                    key={m.id}
                    className={`transition-all duration-200 ${
                      idx !== 0 ? "border-t border-[#1d1d1d]" : ""
                    }`}
                  >
                    <MatchRow
                      match={m}
                      onOpen={() => setOpenMatch(m)}
                      onChat={() => router.push(`/chat?with=${m.id}`)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-center text-[11px] text-gray-5 mt-4">
              {filtered.length} {filtered.length === 1 ? "match" : "matches"}
              {hasSearch || hasFilter ? " matching your filters" : ""}
            </p>
          )}
        </div>
      </main>

      {openMatch && (
        <MatchProfileModal
          match={openMatch}
          onClose={() => setOpenMatch(null)}
          onChat={() => {
            const m = openMatch;
            setOpenMatch(null);
            router.push(`/chat?with=${m.id}`);
          }}
          onUnmatch={async () => {
            const m = openMatch;
            try {
              await api.matches.delete(m.matchId);
              setMatches((prev) =>
                prev.filter((x) => x.matchId !== m.matchId),
              );
              setOpenMatch(null);
            } catch (err) {
              alert(
                err instanceof ApiError
                  ? err.message
                  : "Couldn't unmatch — try again.",
              );
            }
          }}
        />
      )}
    </div>
  );
}

/* ============================================================ Match profile modal */

function MatchProfileModal({
  match,
  onClose,
  onChat,
  onUnmatch,
}: {
  match: Match;
  onClose: () => void;
  onChat: () => void;
  onUnmatch: () => void;
}) {
  const u = match.user;
  const likes = useProfileLikes(u.id);
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/80 backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] my-8 rounded-3xl border-[0.5px] border-white/15 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-5 hover:text-cream hover:bg-white/[0.05] transition-colors"
        >
          ✕
        </button>

        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-[32px] bg-gray-1/60 border-[0.5px] border-white/10">
              {u.avatar ?? "🐦‍⬛"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-syne text-[22px] font-extrabold tracking-[-0.6px] text-cream truncate">
                {u.name ?? u.username}
              </div>
              {(u.role || u.location) && (
                <div className="text-gray-5 text-[12.5px] truncate">
                  {u.role ? `${u.role}${u.location ? " · " : ""}` : ""}
                  {u.location ?? ""}
                </div>
              )}
              {u.personType && (
                <div className="inline-block mt-1 text-[10.5px] uppercase tracking-[0.12em] text-cream/80 border-[0.5px] border-white/15 rounded-full px-2 py-0.5 bg-white/[0.04]">
                  {u.personType}
                </div>
              )}
            </div>
          </div>

          {match.intent && (
            <div className="text-[13.5px] text-cream/85 mb-5 leading-snug">
              Matched on{" "}
              <span className="text-cream font-medium">
                {intentLabel(match.intent)}
              </span>
            </div>
          )}

          {u.currentlyWorkingOn && (
            <MSection title="Currently working on">
              <div className="relative rounded-xl border-[0.5px] border-white/10 bg-white/[0.02] p-3 pr-10">
                <p className="text-[13px] text-cream/90 leading-[1.55]">
                  {u.currentlyWorkingOn}
                </p>
                <LikeHeart
                  active={likes.isLiked("workingOn")}
                  accent={LIKE_ACCENT}
                  position="absolute"
                  className="top-2 right-2"
                  onClick={() => likes.toggle("workingOn")}
                />
              </div>
            </MSection>
          )}

          {u.findMeFor?.length > 0 && (
            <MSection title="Find them for">
              <MLikeChips
                items={u.findMeFor}
                keyPrefix="find"
                isLiked={likes.isLiked}
                onToggle={likes.toggle}
              />
            </MSection>
          )}

          {u.skills?.length > 0 && (
            <MSection title="Skills">
              <MLikeChips
                items={u.skills}
                keyPrefix="skill"
                isLiked={likes.isLiked}
                onToggle={likes.toggle}
              />
            </MSection>
          )}

          {u.interests?.length > 0 && (
            <MSection title="Interests">
              <MLikeChips
                items={u.interests}
                keyPrefix="interest"
                isLiked={likes.isLiked}
                onToggle={likes.toggle}
              />
            </MSection>
          )}

          {u.goals?.length > 0 && (
            <MSection title="Goals">
              <MLikeChips
                items={u.goals}
                keyPrefix="goal"
                isLiked={likes.isLiked}
                onToggle={likes.toggle}
              />
            </MSection>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-[#1d1d1d]">
          <button
            type="button"
            onClick={onUnmatch}
            className="px-4 py-2 rounded-full text-[12.5px] text-[#e08080] border-[0.5px] border-[#e08080]/40 bg-[#e08080]/[0.06] hover:bg-[#e08080]/[0.12] hover:border-[#e08080]/70 transition-all"
          >
            Unmatch
          </button>
          <button
            type="button"
            onClick={onChat}
            className="px-5 py-[10px] rounded-full text-[13px] text-cream border-[0.5px] border-white/30 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md hover:from-white/35 hover:to-white/15 transition-all"
          >
            Open chat →
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

function MSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function MLikeChips({
  items,
  keyPrefix,
  isLiked,
  onToggle,
}: {
  items: string[];
  keyPrefix: string;
  isLiked: (key: string) => boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => {
        const key = `${keyPrefix}:${s}`;
        const on = isLiked(key);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggle(key)}
            className={`inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full border-[0.5px] transition-all cursor-pointer ${
              on
                ? "text-cream border-white/30 bg-white/[0.08]"
                : "text-cream/85 border-white/12 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
            }`}
          >
            {s}
            <LikeHeart
              active={on}
              accent={LIKE_ACCENT}
              size={12}
              inline
              onClick={() => onToggle(key)}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================ Match row */

function MatchRow({
  match,
  onOpen,
  onChat,
}: {
  match: Match;
  onOpen: () => void;
  onChat: () => void;
}) {
  const accent = ACCENT_HEX[match.accent];

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors">
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-4 flex-1 min-w-0 text-left rounded-xl -m-2 p-2 transition-colors hover:bg-white/[0.02]"
      >
        <div
          className="relative flex-shrink-0 rounded-full flex items-center justify-center border-[1.5px]"
          style={{
            width: 52,
            height: 52,
            fontSize: 26,
            background: "rgba(10,10,10,0.55)",
            borderColor: accent,
            boxShadow: `0 0 0 2px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          <span>{match.emoji}</span>
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ink border-[0.5px] flex items-center justify-center"
            style={{ borderColor: `${accent}66` }}
          >
            <IntentBadge intent={match.intent} accent={accent} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-syne text-[18px] font-bold text-cream tracking-[-0.4px] leading-tight">
            {match.name}
          </div>
          <div className="text-[12.5px] text-gray-5 mt-0.5 leading-tight truncate">
            {match.role} at {match.company}
            <span className="text-gray-4 mx-1.5">·</span>
            <span className="text-cream font-semibold">
              {intentLabel(match.intent)}
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onChat}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] text-gray-5 border-[0.5px] border-gray-3 bg-transparent hover:text-cream hover:border-white/30 hover:bg-white/[0.06] transition-all flex-shrink-0"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Chat
      </button>
    </div>
  );
}

function IntentBadge({ intent, accent }: { intent: Intent; accent: string }) {
  const common = {
    className: "w-2.5 h-2.5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: accent,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (intent) {
    case "Hiring":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      );
    case "Project Collab":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case "Referral":
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "Networking":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="12" cy="18" r="2" />
          <line x1="8" y1="7" x2="11" y2="16" />
          <line x1="16" y1="7" x2="13" y2="16" />
          <line x1="8" y1="6" x2="16" y2="6" />
        </svg>
      );
  }
}

/* ============================================================ Filter controls */

function PillButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-[12.5px] border-[0.5px] transition-colors ${
        active
          ? "text-cream bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] font-medium"
          : "text-gray-5 border-gray-3 hover:text-cream hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  allowClear,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);
  const isActive = !!selected;
  const displayLabel = selected?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12.5px] border-[0.5px] transition-colors ${
          isActive
            ? "text-cream bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] font-medium"
            : "text-gray-5 border-gray-3 hover:text-cream hover:border-white/20"
        }`}
      >
        {displayLabel}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-[9999] top-[calc(100%+6px)] left-0 min-w-[180px] rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] p-1.5"
        >
          {allowClear && isActive && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-xl text-[12.5px] text-gray-5 hover:bg-white/5 hover:text-cream transition-colors"
            >
              Clear
            </button>
          )}
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(isSelected && allowClear ? "" : opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-[12.5px] transition-colors ${
                  isSelected
                    ? "bg-white/10 text-cream"
                    : "text-gray-5 hover:bg-white/5 hover:text-cream"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================ Empty state */

function EmptyState({
  title,
  sub,
  actionLabel,
  onAction,
}: {
  title: string;
  sub: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="px-8 py-16 text-center">
      <div className="text-[48px] mb-4 inline-block animate-icon-glow">🪶</div>
      <p className="font-syne text-[20px] text-cream font-extrabold mb-2 tracking-[-0.4px]">
        {title}
      </p>
      <p className="text-[13px] text-gray-5 max-w-[320px] mx-auto mb-6">
        {sub}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-cream border-[0.5px] border-white/30 px-5 py-2.5 rounded-full text-[13px] font-medium bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md hover:from-white/30 hover:to-white/10 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
