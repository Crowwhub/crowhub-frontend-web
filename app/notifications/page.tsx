"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  api,
  ApiError,
  type NotificationItem,
  type NotificationType,
} from "@/lib/api";
import { intentLabel } from "@/lib/intentLabel";

/* ============================================================ Presentation */

// Per-type display: emoji, accent colour, where tapping it should go, and the
// copy builder (uses metadata when present).
const TYPE_META: Record<
  NotificationType,
  {
    emoji: string;
    accent: string;
    href: (n: NotificationItem) => string;
    title: string;
    body: (n: NotificationItem) => string;
  }
> = {
  NEW_MESSAGE: {
    emoji: "💬",
    accent: "#6aab7a",
    href: () => "/chat",
    title: "New message",
    body: (n) => str(n.metadata?.preview) || "You have a new message.",
  },
  COLLAB_REQUEST: {
    emoji: "🤝",
    accent: "#e09b45",
    href: () => "/requests",
    title: "New collaboration request",
    body: (n) => {
      const intent = intentLabel(str(n.metadata?.intent));
      return intent
        ? `Someone wants to connect for ${intent}.`
        : "Someone wants to connect with you.";
    },
  },
  PROJECT_INVITE: {
    emoji: "📨",
    accent: "#9b8cff",
    href: () => "/home",
    title: "New project invite",
    body: () => "You've been invited to a project.",
  },
  NEW_MATCH: {
    emoji: "✨",
    accent: "#6aab7a",
    href: () => "/matches",
    title: "It's a match!",
    body: () => "You matched with someone new. Say hi 👋",
  },
  PROFILE_INTERACTION: {
    emoji: "❤️",
    accent: "#e0696a",
    href: () => "/profile",
    title: "New profile interaction",
    body: (n) => {
      const label = prettifyItemKey(str(n.metadata?.itemKey));
      return label
        ? `Someone liked your ${label}.`
        : "Someone interacted with your profile.";
    },
  },
};

// "goal:Land a job at FAANG" → "goal — Land a job at FAANG"; "skill:React" →
// "React skill"; "workingOn" → "current work".
function prettifyItemKey(itemKey: string): string {
  if (!itemKey) return "";
  const [kind, ...rest] = itemKey.split(":");
  const value = rest.join(":").trim();
  switch (kind) {
    case "goal":
      return value ? `goal "${value}"` : "goal";
    case "skill":
      return value ? `${value} skill` : "skill";
    case "workingOn":
      return "current work";
    default:
      return value || kind;
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(iso).toLocaleDateString();
}

/* ============================================================ Page */

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.notifications.list();
        if (!cancelled) {
          setItems(data);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : "Couldn't load notifications.",
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

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items],
  );

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.read) : items),
    [items, filter],
  );

  // Tell the sidebar badge to refresh its unread count immediately.
  function pokeSidebar() {
    try {
      window.dispatchEvent(new Event("crowhub:notifications-changed"));
    } catch {}
  }

  async function open(n: NotificationItem) {
    const href = TYPE_META[n.type].href(n);
    // Optimistically mark read, fire the API, then navigate.
    if (!n.read) {
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      );
      api.notifications.markRead(n.id).then(pokeSidebar).catch(() => {});
    }
    router.push(href);
  }

  async function markAll() {
    if (marking || unreadCount === 0) return;
    setMarking(true);
    const prev = items;
    setItems((p) => p.map((x) => ({ ...x, read: true }))); // optimistic
    try {
      await api.notifications.markAllRead();
      pokeSidebar();
    } catch {
      setItems(prev); // roll back on failure
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-[12%] right-[16%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.12] animate-blob-1"
          style={{
            background:
              "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[14%] left-[26%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.10] animate-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="md:pl-[260px] min-h-screen px-5 sm:px-8 py-10">
        <div className="max-w-[640px] mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-5 mb-1.5">
                Notifications
              </div>
              <h1 className="font-syne text-[28px] font-extrabold tracking-[-1px] text-cream leading-none">
                Activity
                {unreadCount > 0 && (
                  <span className="ml-2.5 align-middle inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full text-[12px] font-bold text-ink bg-sage-light">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </h1>
            </div>
            <button
              type="button"
              onClick={markAll}
              disabled={marking || unreadCount === 0}
              className="text-[13px] font-medium text-gray-5 hover:text-cream transition-colors disabled:opacity-40 disabled:hover:text-gray-5 whitespace-nowrap"
            >
              Mark all read
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-5">
            {(["all", "unread"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3.5 h-[32px] rounded-full text-[13px] font-medium capitalize transition-colors border-[0.5px] ${
                  filter === f
                    ? "bg-[#1e1e1e] border-[#2e2e2e] text-cream"
                    : "border-transparent text-gray-5 hover:text-cream hover:bg-white/[0.04]"
                }`}
              >
                {f}
                {f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            ))}
          </div>

          {/* States */}
          {loading ? (
            <SkeletonList />
          ) : loadError ? (
            <EmptyState
              emoji="⚠️"
              title="Couldn't load notifications"
              body={loadError}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              emoji="🔔"
              title={filter === "unread" ? "You're all caught up" : "Nothing yet"}
              body={
                filter === "unread"
                  ? "No unread notifications."
                  : "Likes, matches, messages and requests will show up here."
              }
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((n) => {
                const meta = TYPE_META[n.type];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => open(n)}
                      className={`group w-full text-left flex items-start gap-3.5 p-3.5 rounded-2xl border-[0.5px] transition-all duration-150 ${
                        n.read
                          ? "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                          : "border-[#2a2a2a] bg-[#161616] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <span
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[18px] border-[0.5px] border-white/10"
                        style={{ background: `${meta.accent}22` }}
                        aria-hidden="true"
                      >
                        {meta.emoji}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-[14.5px] font-semibold text-cream leading-tight">
                            {meta.title}
                          </span>
                          {!n.read && (
                            <span
                              className="flex-shrink-0 w-2 h-2 rounded-full bg-sage-light shadow-[0_0_6px_rgba(106,171,122,0.7)]"
                              aria-label="Unread"
                            />
                          )}
                        </span>
                        <span className="block mt-0.5 text-[13px] text-gray-5 leading-snug truncate">
                          {meta.body(n)}
                        </span>
                      </span>
                      <span className="flex-shrink-0 text-[11.5px] text-gray-5/80 whitespace-nowrap pt-0.5">
                        {timeAgo(n.createdAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

/* ============================================================ Sub-views */

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.02]"
        >
          <div className="w-10 h-10 rounded-full bg-white/[0.05] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-white/[0.05] animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-6">
      <div className="text-[44px] mb-4 animate-icon-glow">{emoji}</div>
      <h2 className="font-syne text-[20px] font-extrabold tracking-[-0.5px] text-cream mb-2">
        {title}
      </h2>
      <p className="text-[13.5px] text-gray-5 leading-[1.6] font-light max-w-[340px]">
        {body}
      </p>
    </div>
  );
}
