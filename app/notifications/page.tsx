"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

/* ============================================================ Types & data */

type Accent = "sage" | "amber" | "cream";

type Intent = "Project Collab" | "Hiring" | "Referral" | "Networking" | "Mentorship";

type Base = {
  id: string;
  name: string;
  emoji: string;
  accent: Accent;
  timestamp: string;
  read: boolean;
};

type Notif =
  | (Base & { kind: "follow" })
  | (Base & { kind: "message"; preview: string })
  | (Base & { kind: "request"; role: string; company: string; intent: Intent; status?: "pending" | "accepted" | "dismissed" })
  | (Base & { kind: "review"; rating: number; snippet: string })
  | (Base & { kind: "mention"; postQuote: string });

const ACCENT_HEX: Record<Accent, string> = {
  sage: "#6aab7a",
  amber: "#e09b45",
  cream: "#f5f5f0",
};

const INITIAL: Notif[] = [
  {
    id: "n1",
    kind: "request",
    name: "Aarav Mehta",
    emoji: "🐦‍⬛",
    accent: "sage",
    timestamp: "2m ago",
    read: false,
    role: "Product Designer",
    company: "Zyra Labs",
    intent: "Project Collab",
    status: "pending",
  },
  {
    id: "n2",
    kind: "mention",
    name: "Neha Sharma",
    emoji: "🦉",
    accent: "amber",
    timestamp: "12m ago",
    read: false,
    postQuote:
      "Looking for someone like @you for our generative type project — anyone got recs from the Bangalore scene?",
  },
  {
    id: "n3",
    kind: "review",
    name: "Rohan Verma",
    emoji: "🦅",
    accent: "sage",
    timestamp: "1h ago",
    read: false,
    rating: 5,
    snippet:
      "Honestly one of the easiest collaborations I've had — clear, kind, and fast. Would absolutely work together again.",
  },
  {
    id: "n4",
    kind: "request",
    name: "Tara Singh",
    emoji: "🦢",
    accent: "amber",
    timestamp: "3h ago",
    read: false,
    role: "CTO",
    company: "Lensit",
    intent: "Hiring",
    status: "pending",
  },
  {
    id: "n5",
    kind: "follow",
    name: "Maya Bhatt",
    emoji: "🐧",
    accent: "cream",
    timestamp: "5h ago",
    read: false,
  },
  {
    id: "n6",
    kind: "message",
    name: "Sara Mehra",
    emoji: "🦜",
    accent: "amber",
    timestamp: "Yesterday",
    read: false,
    preview: "hey! saw your writing on data viz — any chance you take pitches?",
  },
  {
    id: "n7",
    kind: "request",
    name: "Vikram Rao",
    emoji: "🦉",
    accent: "sage",
    timestamp: "Yesterday",
    read: true,
    role: "Creative Director",
    company: "Field Studio",
    intent: "Referral",
    status: "pending",
  },
  {
    id: "n8",
    kind: "mention",
    name: "Diya Krishnan",
    emoji: "🦢",
    accent: "sage",
    timestamp: "2d ago",
    read: false,
    postQuote:
      "Loved the breakdown @you posted on session-based pricing — bookmarking for next week's deck.",
  },
  {
    id: "n9",
    kind: "review",
    name: "Kavya Iyer",
    emoji: "🦆",
    accent: "amber",
    timestamp: "2d ago",
    read: true,
    rating: 4,
    snippet:
      "Solid work, great vibes. Only ding is delivery timeline slipped a couple of days but quality made up for it.",
  },
  {
    id: "n10",
    kind: "request",
    name: "Nikhil Reddy",
    emoji: "🦅",
    accent: "amber",
    timestamp: "3d ago",
    read: true,
    role: "Data Analyst",
    company: "Pluto Health",
    intent: "Networking",
    status: "pending",
  },
  {
    id: "n11",
    kind: "follow",
    name: "Karan Malhotra",
    emoji: "🐦",
    accent: "sage",
    timestamp: "4d ago",
    read: true,
  },
  {
    id: "n12",
    kind: "review",
    name: "Sanjay Iyer",
    emoji: "🐧",
    accent: "cream",
    timestamp: "1w ago",
    read: true,
    rating: 5,
    snippet: "Sharp eye for detail and great taste. Going to recommend you to my team.",
  },
];

const TABS = [
  { id: "all", label: "All" },
  { id: "requests", label: "Requests" },
  { id: "reviews", label: "Reviews" },
  { id: "mentions", label: "Mentions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ============================================================ Page */

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const initialTab =
    (searchParams?.get("tab") as TabId | null) &&
    TABS.some((t) => t.id === searchParams?.get("tab"))
      ? (searchParams?.get("tab") as TabId)
      : "all";

  const [items, setItems] = useState<Notif[]>(INITIAL);
  const [tab, setTab] = useState<TabId>(initialTab);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const unreadCount = useMemo(
    () =>
      items.filter((n) => {
        if (n.kind === "request" && n.status !== "pending") return false;
        return !n.read;
      }).length,
    [items]
  );

  const pendingRequests = useMemo(
    () =>
      items.filter(
        (n) =>
          n.kind === "request" && (!n.status || n.status === "pending")
      ).length,
    [items]
  );

  useEffect(() => {
    try {
      localStorage.setItem("crowhub:notifications:unread", String(unreadCount));
      window.dispatchEvent(new CustomEvent("crowhub:notifications-changed"));
    } catch {}
  }, [unreadCount]);

  useEffect(() => {
    try {
      localStorage.setItem("crowhub:requests:pending", String(pendingRequests));
      window.dispatchEvent(new CustomEvent("crowhub:requests-changed"));
    } catch {}
  }, [pendingRequests]);

  function markRead(id: string) {
    setItems((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function decideRequest(id: string, decision: "accepted" | "dismissed") {
    setExiting((s) => {
      const next = new Set(s);
      next.add(id);
      return next;
    });
    window.setTimeout(() => {
      setItems((list) =>
        list.map((n) =>
          n.id === id && n.kind === "request"
            ? { ...n, status: decision, read: true }
            : n
        )
      );
      setExiting((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }, 320);
  }

  const visible = useMemo(() => {
    if (tab === "all")
      return items.filter(
        (n) => !(n.kind === "request" && n.status && n.status !== "pending")
      );
    if (tab === "requests")
      return items.filter(
        (n) => n.kind === "request" && (!n.status || n.status === "pending")
      );
    if (tab === "reviews") return items.filter((n) => n.kind === "review");
    return items.filter((n) => n.kind === "mention");
  }, [items, tab]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-[12%] right-[12%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.12] animate-blob-1"
          style={{
            background: "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[12%] left-[26%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.10] animate-blob-2"
          style={{
            background: "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="md:pl-[260px]">
        <div className="px-8 pt-12 pb-20 max-w-[760px]">
          <div className="mb-3">
            <h1 className="font-syne text-[36px] font-extrabold tracking-[-1.4px] text-cream leading-none">
              Notifications 🔔
            </h1>
            <p className="text-[13px] text-gray-5 mt-3 font-light">
              Catch up and start meaningful conversations.
            </p>
          </div>

          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-full text-[13px] transition-all ${
                    active
                      ? "text-cream bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] border-[0.5px] border-white/25 font-medium"
                      : "text-gray-5 hover:text-cream border-[0.5px] border-transparent"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md overflow-hidden">
            {visible.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <ul className="flex flex-col">
                {visible.map((n, idx) => (
                  <li
                    key={n.id}
                    className={`transition-all duration-300 ${
                      idx !== 0 ? "border-t border-[#1d1d1d]" : ""
                    } ${
                      exiting.has(n.id)
                        ? "opacity-0 translate-x-8 pointer-events-none max-h-0 overflow-hidden"
                        : "opacity-100 translate-x-0"
                    }`}
                    style={{
                      maxHeight: exiting.has(n.id) ? 0 : 999,
                    }}
                  >
                    <NotifRow
                      notif={n}
                      tab={tab}
                      onMarkRead={markRead}
                      onAccept={() => decideRequest(n.id, "accepted")}
                      onDismiss={() => decideRequest(n.id, "dismissed")}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================ Row */

function NotifRow({
  notif,
  tab,
  onMarkRead,
  onAccept,
  onDismiss,
}: {
  notif: Notif;
  tab: TabId;
  onMarkRead: (id: string) => void;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const accent = ACCENT_HEX[notif.accent];

  const isRequestRow = notif.kind === "request" && tab === "requests";
  const isClickable = !isRequestRow;

  const handleClick = () => {
    if (!isClickable) return;
    if (!notif.read) onMarkRead(notif.id);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKey : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        isClickable ? `Mark notification from ${notif.name} as read` : undefined
      }
      className={`group w-full flex items-center gap-4 px-5 py-4 text-left transition-colors outline-none ${
        notif.read ? "bg-transparent" : "bg-white/[0.02]"
      } ${
        isClickable
          ? "hover:bg-white/[0.04] cursor-pointer focus-visible:bg-white/[0.04]"
          : "cursor-default"
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity ${
          notif.read ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: accent }}
      />

      <Avatar
        emoji={notif.emoji}
        accent={accent}
        size={isRequestRow ? 52 : 48}
        badgeKind={notif.kind}
      />

      <div className="flex-1 min-w-0">
        {isRequestRow ? (
          <RequestBody notif={notif as Notif & { kind: "request" }} />
        ) : (
          <RowBody notif={notif} />
        )}
      </div>

      {isRequestRow ? (
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            aria-label="Dismiss"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-5 border-[0.5px] border-gray-3 hover:text-cream hover:border-white/20 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="text-cream border-[0.5px] border-white/30 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(0,0,0,0.25)] hover:from-white/35 hover:to-white/15 transition-all"
          >
            Accept
          </button>
        </div>
      ) : (
        <span className="text-[11px] text-gray-5 whitespace-nowrap ml-3 flex-shrink-0">
          {notif.timestamp}
        </span>
      )}
    </div>
  );
}

function RowBody({ notif }: { notif: Notif }) {
  switch (notif.kind) {
    case "follow":
      return (
        <p className="text-[13.5px] text-gray-5 leading-snug">
          <span className="text-cream font-semibold">{notif.name}</span> started following you
        </p>
      );
    case "message":
      return (
        <div>
          <p className="text-[13.5px] text-gray-5 leading-snug">
            <span className="text-cream font-semibold">{notif.name}</span> sent you a message
          </p>
          <p className="text-[12px] text-gray-5 mt-0.5 truncate font-light">
            {notif.preview}
          </p>
        </div>
      );
    case "request":
      return (
        <p className="text-[13.5px] text-gray-5 leading-snug">
          <span className="text-cream font-semibold">{notif.name}</span> sent you a connection request
        </p>
      );
    case "review":
      return (
        <div>
          <p className="text-[13.5px] text-gray-5 leading-snug flex items-center gap-2">
            <span className="text-cream font-semibold">{notif.name}</span>
            <span>left you a review</span>
            <Stars rating={notif.rating} />
          </p>
          <p className="text-[12px] text-gray-5 italic mt-0.5 truncate font-light">
            "{notif.snippet}"
          </p>
        </div>
      );
    case "mention":
      return (
        <div>
          <p className="text-[13.5px] text-gray-5 leading-snug">
            <span className="text-cream font-semibold">{notif.name}</span> mentioned you in a post
          </p>
          <p className="text-[12px] text-gray-5 mt-1 pl-3 border-l-2 border-gray-3 line-clamp-2 font-light">
            {notif.postQuote}
          </p>
        </div>
      );
  }
}

function RequestBody({
  notif,
}: {
  notif: Notif & { kind: "request" };
}) {
  return (
    <div>
      <div className="font-syne text-[16px] font-bold text-cream tracking-[-0.3px] leading-tight">
        {notif.name}
      </div>
      <div className="text-[12px] text-gray-5 mt-0.5 leading-tight">
        {notif.role} at {notif.company}{" "}
        <span className="text-gray-4 mx-1">·</span>
        <span className="text-cream font-semibold">{notif.intent}</span>
      </div>
    </div>
  );
}

/* ============================================================ Avatar + badge */

function Avatar({
  emoji,
  accent,
  size,
  badgeKind,
}: {
  emoji: string;
  accent: string;
  size: number;
  badgeKind: Notif["kind"];
}) {
  return (
    <div
      className="relative flex-shrink-0 rounded-full flex items-center justify-center border-[1.5px]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: "rgba(10,10,10,0.55)",
        borderColor: accent,
        boxShadow: `0 0 0 2px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      <span>{emoji}</span>
      <div
        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ink border-[0.5px] border-white/20 flex items-center justify-center"
      >
        <BadgeIcon kind={badgeKind} />
      </div>
    </div>
  );
}

function BadgeIcon({ kind }: { kind: Notif["kind"] }) {
  const common = {
    className: "w-2.5 h-2.5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "follow":
      return (
        <svg {...common} className="w-2.5 h-2.5 text-sage-light">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      );
    case "message":
      return (
        <svg {...common} className="w-2.5 h-2.5 text-amber-light">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "request":
      return (
        <svg {...common} className="w-2.5 h-2.5 text-sage-light">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case "review":
      return (
        <svg
          {...common}
          className="w-2.5 h-2.5 text-amber-light"
          fill="currentColor"
          strokeWidth={1}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "mention":
      return (
        <svg {...common} className="w-2.5 h-2.5 text-sage-light">
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      );
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-[1px]" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill={n <= rating ? "#e09b45" : "none"}
          stroke={n <= rating ? "#e09b45" : "#555"}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

/* ============================================================ Empty state */

function EmptyState({ tab }: { tab: TabId }) {
  const msg = (() => {
    switch (tab) {
      case "requests":
        return {
          title: "You're all caught up",
          sub: "No pending requests right now.",
        };
      case "reviews":
        return {
          title: "No reviews yet",
          sub: "Reviews from people you've connected with will appear here.",
        };
      case "mentions":
        return {
          title: "No mentions",
          sub: "When someone tags you in a post, you'll see it here.",
        };
      default:
        return {
          title: "Nothing new",
          sub: "Your flock is quiet. Check back later.",
        };
    }
  })();

  return (
    <div className="px-8 py-16 text-center">
      <div className="text-[48px] mb-4 inline-block animate-icon-glow">🪶</div>
      <p className="font-syne text-[20px] text-cream font-extrabold mb-2 tracking-[-0.4px]">
        {msg.title}
      </p>
      <p className="text-[13px] text-gray-5 max-w-[320px] mx-auto">{msg.sub}</p>
    </div>
  );
}
