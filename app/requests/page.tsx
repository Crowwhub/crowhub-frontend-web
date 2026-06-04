"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import LikeHeart from "@/components/LikeHeart";
import { api, ApiError, type SwipeFilters, type SwipeRequest } from "@/lib/api";
import { useProfileLikes } from "@/lib/useProfileLikes";

const ACCENT = "#6aab7a";

export default function RequestsPage() {
  const [requests, setRequests] = useState<SwipeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [matched, setMatched] = useState<SwipeRequest | null>(null);
  const [openProfile, setOpenProfile] = useState<SwipeRequest | null>(null);

  // Hook is scoped to the currently-open profile modal.
  const openProfileLikes = useProfileLikes(openProfile?.user.id);
  const isLiked = (userId: string, key: string) =>
    userId === openProfile?.user.id ? openProfileLikes.isLiked(key) : false;
  const toggleLike = (userId: string, key: string) => {
    if (userId !== openProfile?.user.id) return;
    void openProfileLikes.toggle(key);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.swipes.requests();
      setRequests(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function respond(req: SwipeRequest, direction: "RIGHT" | "LEFT") {
    setActingOn(req.swipeId);
    try {
      const res = await api.swipes.create({
        swipedId: req.user.id,
        direction,
        intent: req.intent ?? undefined,
        domain: req.domain ?? undefined,
      });
      setRequests((prev) => prev.filter((r) => r.swipeId !== req.swipeId));
      if (direction === "RIGHT" && res.ismatch) {
        setMatched(req);
      }
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Couldn't update — try again."
      );
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <Sidebar />
      <main className="md:pl-[260px]">
        <div className="px-8 pt-12 pb-20 max-w-[760px] mx-auto">
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gray-5 mb-1.5">
              People who swiped on you
            </div>
            <h1 className="font-syne text-[32px] font-extrabold tracking-[-1.2px] text-cream leading-none">
              Requests
            </h1>
          </div>

          {loading ? (
            <StatusBox message="Loading requests…" />
          ) : error ? (
            <StatusBox message={error} tone="error" onRetry={refresh} />
          ) : requests.length === 0 ? (
            <StatusBox message="No new requests right now. Keep swiping on /home." />
          ) : (
            <ul className="flex flex-col gap-3">
              {requests.map((r) => (
                <li key={r.swipeId}>
                  <RequestCard
                    request={r}
                    busy={actingOn === r.swipeId}
                    onOpen={() => setOpenProfile(r)}
                    onAccept={() => respond(r, "RIGHT")}
                    onReject={() => respond(r, "LEFT")}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {openProfile && (
        <RequestProfileModal
          request={openProfile}
          busy={actingOn === openProfile.swipeId}
          onClose={() => setOpenProfile(null)}
          isLiked={isLiked}
          onToggleLike={toggleLike}
          onAccept={async () => {
            const r = openProfile;
            setOpenProfile(null);
            await respond(r, "RIGHT");
          }}
          onReject={async () => {
            const r = openProfile;
            setOpenProfile(null);
            await respond(r, "LEFT");
          }}
        />
      )}

      {matched && (
        <MatchModal request={matched} onClose={() => setMatched(null)} />
      )}
    </div>
  );
}

function RequestCard({
  request,
  busy,
  onOpen,
  onAccept,
  onReject,
}: {
  request: SwipeRequest;
  busy: boolean;
  onOpen: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const u = request.user;
  return (
    <div className="rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/60 to-gray-2/40 backdrop-blur-md p-5 flex items-center gap-4">
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-4 flex-1 min-w-0 text-left rounded-xl -m-2 p-2 transition-colors hover:bg-white/[0.03]"
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-[28px] bg-gray-1/60 border-[0.5px] border-white/10 shrink-0">
          {u.avatar ?? "🐦‍⬛"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-cream text-[15px] font-medium truncate">
            {u.name ?? u.username}
          </div>
          {u.domain && (
            <div className="text-gray-5 text-[12px] truncate capitalize">
              {u.domain.replace(/-/g, " ")}
              {u.location ? ` · ${u.location}` : ""}
            </div>
          )}
          {!u.domain && u.location && (
            <div className="text-gray-5 text-[12px] truncate">{u.location}</div>
          )}
          {request.intent && (
            <div className="text-[12.5px] text-cream/85 mt-1.5">
              <div className="truncate">
                Sent you a request for{" "}
                <span className="text-cream font-medium">{request.intent}</span>
              </div>
              <FilterContext
                filters={request.filters}
                truncate
                className="mt-0.5"
              />
            </div>
          )}
        </div>
      </button>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className="px-4 py-2 rounded-full text-[12px] text-gray-5 border-[0.5px] border-gray-3 hover:text-cream hover:border-white/20 transition-colors disabled:opacity-40"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className="px-4 py-2 rounded-full text-[12px] text-cream border-[0.5px] border-white/30 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md hover:from-white/35 hover:to-white/15 transition-all disabled:opacity-40"
        >
          {busy ? "…" : "Accept"}
        </button>
      </div>
    </div>
  );
}

function StatusBox({
  message,
  tone = "info",
  onRetry,
}: {
  message: string;
  tone?: "info" | "error";
  onRetry?: () => void;
}) {
  const isError = tone === "error";
  return (
    <div className="rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/60 to-gray-2/40 backdrop-blur-md px-6 py-10 text-center">
      <div className="text-[36px] mb-3">{isError ? "⚠️" : "🪶"}</div>
      <p className="text-[14px] text-cream max-w-[340px] mx-auto">{message}</p>
      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 rounded-full text-[12px] text-cream border-[0.5px] border-white/25 hover:border-white/40 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function RequestProfileModal({
  request,
  busy,
  onClose,
  onAccept,
  onReject,
  isLiked,
  onToggleLike,
}: {
  request: SwipeRequest;
  busy: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  isLiked: (userId: string, key: string) => boolean;
  onToggleLike: (userId: string, key: string) => void;
}) {
  const u = request.user;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
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

          {request.intent && (
            <div className="text-[13.5px] text-cream/85 mb-5 leading-snug">
              Sent you a request for{" "}
              <span className="text-cream font-medium">{request.intent}</span>
              {request.domain && (
                <>
                  {" "}
                  in{" "}
                  <span className="text-cream font-medium capitalize">
                    {request.domain.replace(/-/g, " ")}
                  </span>
                </>
              )}
              <FilterContext filters={request.filters} className="mt-1.5" />
            </div>
          )}

          {u.currentlyWorkingOn && (
            <Section title="Currently working on">
              <div className="relative rounded-xl border-[0.5px] border-white/10 bg-white/[0.02] p-3 pr-10">
                <p className="text-[13px] text-cream/90 leading-[1.55]">
                  {u.currentlyWorkingOn}
                </p>
                <LikeHeart
                  active={isLiked(u.id, "workingOn")}
                  accent={ACCENT}
                  position="absolute"
                  className="top-2 right-2"
                  onClick={() => onToggleLike(u.id, "workingOn")}
                />
              </div>
            </Section>
          )}

          {u.findMeFor?.length > 0 && (
            <Section title="Find them for">
              <LikeChips
                items={u.findMeFor}
                keyPrefix="find"
                userId={u.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
              />
            </Section>
          )}

          {u.skills?.length > 0 && (
            <Section title="Skills">
              <LikeChips
                items={u.skills}
                keyPrefix="skill"
                userId={u.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
              />
            </Section>
          )}

          {u.interests?.length > 0 && (
            <Section title="Interests">
              <LikeChips
                items={u.interests}
                keyPrefix="interest"
                userId={u.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
              />
            </Section>
          )}

          {u.goals?.length > 0 && (
            <Section title="Goals">
              <LikeChips
                items={u.goals}
                keyPrefix="goal"
                userId={u.id}
                isLiked={isLiked}
                onToggleLike={onToggleLike}
              />
            </Section>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 p-6 border-t border-[#1d1d1d]">
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            aria-label="Decline request"
            className="w-14 h-14 rounded-full flex items-center justify-center text-[#e08080] border-[0.5px] border-[#e08080]/40 bg-[#e08080]/[0.06] hover:bg-[#e08080]/[0.12] hover:border-[#e08080]/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
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
          <button
            type="button"
            onClick={onAccept}
            disabled={busy}
            aria-label="Accept request"
            className="w-14 h-14 rounded-full flex items-center justify-center text-sage-light border-[0.5px] border-sage-light/40 bg-sage-light/[0.08] hover:bg-sage-light/[0.16] hover:border-sage-light/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

const FILTER_LABELS: Record<keyof SwipeFilters, string> = {
  personType: "type",
  location: "location",
  interest: "interest",
  goal: "goal",
  skill: "skill",
};

function FilterContext({
  filters,
  truncate = false,
  className,
}: {
  filters: SwipeFilters | null | undefined;
  truncate?: boolean;
  className?: string;
}) {
  if (!filters) return null;
  const entries = (Object.keys(FILTER_LABELS) as Array<keyof SwipeFilters>)
    .map((key) => {
      const value = filters[key];
      if (!value || typeof value !== "string" || !value.trim()) return null;
      return { key, value };
    })
    .filter((e): e is { key: keyof SwipeFilters; value: string } => e !== null);

  if (entries.length === 0) return null;

  return (
    <div
      className={`text-[11.5px] text-gray-5 ${truncate ? "truncate" : ""} ${
        className ?? ""
      }`}
    >
      on the basis of{" "}
      {entries.map((e, i) => (
        <span key={e.key}>
          {i > 0 ? ", " : ""}
          <span className="text-cream/80">{FILTER_LABELS[e.key]}: </span>
          <span className="text-cream/95">{e.value}</span>
        </span>
      ))}
    </div>
  );
}

function LikeChips({
  items,
  keyPrefix,
  userId,
  isLiked,
  onToggleLike,
}: {
  items: string[];
  keyPrefix: string;
  userId: string;
  isLiked: (userId: string, key: string) => boolean;
  onToggleLike: (userId: string, key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => {
        const key = `${keyPrefix}:${s}`;
        const on = isLiked(userId, key);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggleLike(userId, key)}
            className={`inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full border-[0.5px] transition-all cursor-pointer ${
              on
                ? "text-cream border-white/30 bg-white/[0.08]"
                : "text-cream/85 border-white/12 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
            }`}
          >
            {s}
            <LikeHeart
              active={on}
              accent={ACCENT}
              size={12}
              inline
              onClick={() => onToggleLike(userId, key)}
            />
          </button>
        );
      })}
    </div>
  );
}

function MatchModal({
  request,
  onClose,
}: {
  request: SwipeRequest;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[400px] w-full mx-4 rounded-3xl border-[0.5px] border-white/15 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="text-[64px] mb-4 animate-icon-glow inline-block">🪶</div>
        <h2 className="font-syne text-[26px] font-extrabold tracking-[-0.8px] text-cream mb-2">
          You matched!
        </h2>
        <p className="text-[14px] text-gray-5 mb-6">
          You and{" "}
          <span className="text-cream">
            {request.user.name ?? request.user.username}
          </span>{" "}
          are now connected.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/matches"
            className="px-5 py-[12px] rounded-full text-[13px] text-cream border-[0.5px] border-white/30 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md hover:from-white/35 hover:to-white/15 transition-all"
          >
            View matches
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-[12px] rounded-full text-[13px] text-gray-5 border-[0.5px] border-gray-3 hover:text-cream hover:border-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
