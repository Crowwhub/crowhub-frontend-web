"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useChatSocket } from "@/lib/useChatSocket";
import {
  api,
  ApiError,
  type ChatMessage,
  type MatchRecord,
} from "@/lib/api";

/* ============================================================ Types & data */

type Accent = "sage" | "amber";

type Conversation = {
  matchId: string;
  userId: string;
  name: string;
  emoji: string;
  accent: Accent;
  role: string;
  company: string;
  intent: string;
  createdAt: string;
};

// View-model for a rendered bubble, derived from a ChatMessage.
type ViewMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  day: string;
};

const ACCENT_HEX: Record<Accent, string> = {
  sage: "#6aab7a",
  amber: "#e09b45",
};

function toConversation(m: MatchRecord): Conversation {
  const u = m.user;
  const accent: Accent = (u.id.charCodeAt(0) || 0) % 2 === 0 ? "sage" : "amber";
  return {
    matchId: m.matchId,
    userId: u.id,
    name: u.name ?? u.username,
    emoji: u.avatar ?? "🐦‍⬛",
    accent,
    role: u.role ?? "",
    company: u.location ?? "",
    intent: m.intent ?? "",
    createdAt: m.createdAt,
  };
}

/* ============================================================ Time helpers */

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ============================================================ Page */

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialWith = searchParams?.get("with") ?? null;

  const [myId, setMyId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composer, setComposer] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;
  const loadedHistory = useRef<Set<string>>(new Set());

  // Append a message, de-duping by id (history reloads + socket echoes overlap).
  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
    );
  }, []);

  // Live messages from the socket.
  const onSocketMessage = useCallback(
    (msg: ChatMessage) => {
      appendMessage(msg);
      const isMine = !!myId && msg.senderId === myId;
      if (!isMine && msg.matchId !== selectedIdRef.current) {
        setUnread((u) => ({ ...u, [msg.matchId]: (u[msg.matchId] ?? 0) + 1 }));
      }
    },
    [appendMessage, myId]
  );

  const roomIds = useMemo(
    () => conversations.map((c) => c.matchId),
    [conversations]
  );
  const { sendMessage: socketSend } = useChatSocket({
    roomIds,
    onMessage: onSocketMessage,
  });

  // Initial load: current user + conversations.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, matches] = await Promise.all([
          api.me.get(),
          api.matches.list(),
        ]);
        if (cancelled) return;
        setMyId(me.id);
        const convs = matches.map(toConversation);
        setConversations(convs);
        // Select the conversation from ?with=<userId>, else the first.
        const fromParam = initialWith
          ? convs.find((c) => c.userId === initialWith)
          : undefined;
        setSelectedId(fromParam?.matchId ?? convs[0]?.matchId ?? null);
        setLoadError(null);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            window.location.href = "/auth/login";
            return;
          }
          setLoadError(
            err instanceof ApiError ? err.message : "Couldn't load chats."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialWith]);

  // Load history for a conversation the first time it's opened, clear its unread.
  useEffect(() => {
    if (!selectedId) return;
    setUnread((u) => (u[selectedId] ? { ...u, [selectedId]: 0 } : u));
    if (loadedHistory.current.has(selectedId)) return;
    loadedHistory.current.add(selectedId);
    let cancelled = false;
    (async () => {
      try {
        const history = await api.chat.history(selectedId);
        if (cancelled) return;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const fresh = history.filter((m) => !seen.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
      } catch {
        // Allow a retry on next open if history failed to load.
        loadedHistory.current.delete(selectedId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const convMessages = useMemo<ViewMessage[]>(() => {
    if (!selectedId) return [];
    return messages
      .filter((m) => m.matchId === selectedId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      .map((m) => ({
        id: m.id,
        from: myId && m.senderId === myId ? "me" : "them",
        text: m.message,
        time: formatTime(m.createdAt),
        day: dayLabel(m.createdAt),
      }));
  }, [messages, selectedId, myId]);

  // Last message per conversation, for the list preview + ordering.
  const lastByConv = useMemo(() => {
    const map: Record<string, ChatMessage> = {};
    for (const m of messages) {
      const cur = map[m.matchId];
      if (!cur || +new Date(m.createdAt) >= +new Date(cur.createdAt)) {
        map[m.matchId] = m;
      }
    }
    return map;
  }, [messages]);

  const orderedConvs = useMemo(() => {
    const stamp = (c: Conversation) =>
      +new Date(lastByConv[c.matchId]?.createdAt ?? c.createdAt);
    return [...conversations].sort((a, b) => stamp(b) - stamp(a));
  }, [conversations, lastByConv]);

  const filteredConvs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orderedConvs;
    return orderedConvs.filter((c) =>
      [c.name, c.role, c.company].some((s) => s.toLowerCase().includes(q))
    );
  }, [orderedConvs, search]);

  const selected = conversations.find((c) => c.matchId === selectedId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages.length, selectedId]);

  function sendMessage() {
    const text = composer.trim();
    if (!text || !selectedId || !myId) return;
    socketSend(selectedId, myId, text);
    setComposer("");
    composerRef.current?.focus();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <Sidebar />
      <main className="md:pl-[260px] h-screen flex">
        <ConvList
          conversations={filteredConvs}
          selectedId={selectedId}
          onSelect={setSelectedId}
          lastByConv={lastByConv}
          unread={unread}
          myId={myId}
          search={search}
          setSearch={setSearch}
          loading={loading}
          error={loadError}
        />

        {selected ? (
          <ConvView
            conversation={selected}
            messages={convMessages}
            composer={composer}
            setComposer={setComposer}
            onSend={sendMessage}
            messagesEndRef={messagesEndRef}
            composerRef={composerRef}
          />
        ) : (
          <EmptyConv loading={loading} hasConversations={conversations.length > 0} />
        )}
      </main>
    </div>
  );
}

/* ============================================================ Conversation list */

function ConvList({
  conversations,
  selectedId,
  onSelect,
  lastByConv,
  unread,
  myId,
  search,
  setSearch,
  loading,
  error,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  lastByConv: Record<string, ChatMessage>;
  unread: Record<string, number>;
  myId: string | null;
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <aside className="hidden md:flex w-[340px] flex-shrink-0 flex-col border-r border-[#222] bg-gray-1/40 backdrop-blur-md">
      <div className="px-5 pt-7 pb-4">
        <h2 className="font-syne text-[22px] font-extrabold tracking-[-0.5px] text-cream mb-3">
          Messages
        </h2>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-5 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
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
            placeholder="Search Direct Messages"
            className="w-full bg-gray-1/60 backdrop-blur-md border-[0.5px] border-white/10 rounded-full pl-10 pr-4 py-2 text-cream text-[13px] outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-5 py-10 text-center text-[12px] text-gray-5">
            Loading conversations…
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center text-[12px] text-amber-light">
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12px] text-gray-5">
            No conversations yet. Match with crows to start chatting.
          </div>
        ) : (
          conversations.map((c) => (
            <ConvListRow
              key={c.matchId}
              conversation={c}
              isSelected={c.matchId === selectedId}
              lastMessage={lastByConv[c.matchId]}
              unread={unread[c.matchId] ?? 0}
              myId={myId}
              onClick={() => onSelect(c.matchId)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function ConvListRow({
  conversation,
  isSelected,
  lastMessage,
  unread,
  myId,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  lastMessage?: ChatMessage;
  unread: number;
  myId: string | null;
  onClick: () => void;
}) {
  const accent = ACCENT_HEX[conversation.accent];
  const preview = lastMessage
    ? (myId && lastMessage.senderId === myId ? "You: " : "") + lastMessage.message
    : "Say hi 👋";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-5 py-3 border-l-2 text-left transition-colors ${
        isSelected
          ? "bg-white/[0.04] border-l-cream"
          : "bg-transparent border-l-transparent hover:bg-white/[0.025]"
      }`}
    >
      <div
        className="relative flex-shrink-0 rounded-full flex items-center justify-center border-[1.5px]"
        style={{
          width: 44,
          height: 44,
          fontSize: 22,
          background: "rgba(10,10,10,0.55)",
          borderColor: accent,
          boxShadow: `0 0 0 2px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        <span>{conversation.emoji}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-syne text-[14.5px] font-bold text-cream truncate tracking-[-0.2px]">
            {conversation.name}
          </span>
          <span className="text-[10px] text-gray-5 whitespace-nowrap flex-shrink-0">
            {lastMessage ? formatTime(lastMessage.createdAt) : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-[12px] truncate flex-1 ${
              unread > 0 && !isSelected ? "text-cream" : "text-gray-5"
            }`}
          >
            {preview}
          </p>
          {unread > 0 && !isSelected && (
            <span
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold text-ink flex-shrink-0"
              style={{ background: "#6aab7a" }}
            >
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ============================================================ Conversation view */

function ConvView({
  conversation,
  messages,
  composer,
  setComposer,
  onSend,
  messagesEndRef,
  composerRef,
}: {
  conversation: Conversation;
  messages: ViewMessage[];
  composer: string;
  setComposer: (v: string) => void;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  composerRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const accent = ACCENT_HEX[conversation.accent];
  const subtitle = [conversation.role, conversation.company]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="flex-1 min-w-0 flex flex-col bg-ink">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222] bg-gray-1/40 backdrop-blur-md">
        <div
          className="relative flex-shrink-0 rounded-full flex items-center justify-center border-[1.5px]"
          style={{
            width: 40,
            height: 40,
            fontSize: 20,
            background: "rgba(10,10,10,0.55)",
            borderColor: accent,
            boxShadow: `0 0 0 2px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          <span>{conversation.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-syne text-[15px] font-bold text-cream tracking-[-0.3px] leading-tight">
            {conversation.name}
          </div>
          <div className="text-[11.5px] text-gray-5 leading-tight truncate">
            {subtitle || "Matched on CrowHub"}
            {conversation.intent && (
              <>
                <span className="text-gray-4 mx-1.5">·</span>
                <span className="text-cream font-medium">
                  {conversation.intent}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-5 hover:text-cream hover:bg-white/[0.05] transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <ChatEmpty conversation={conversation} />
        ) : (
          <Thread messages={messages} accent={accent} />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#222] bg-gray-1/40 backdrop-blur-md p-4">
        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label="Attach"
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-5 hover:text-cream hover:bg-white/[0.05] transition-colors flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <textarea
            ref={composerRef}
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Start a new message"
            className="flex-1 resize-none bg-gray-1/60 backdrop-blur-md border-[0.5px] border-white/10 rounded-3xl px-5 py-2.5 text-cream text-[14px] outline-none placeholder:text-gray-4 transition-colors focus:border-white/30 leading-snug max-h-[140px]"
            style={{ minHeight: 42 }}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!composer.trim()}
            aria-label="Send"
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:scale-[1.05]"
            style={{
              background: composer.trim()
                ? "linear-gradient(180deg, rgba(245,245,240,1), rgba(220,220,210,1))"
                : "rgba(255,255,255,0.06)",
              boxShadow: composer.trim()
                ? "inset 0 1px 0 rgba(255,255,255,0.45), 0 4px 12px rgba(0,0,0,0.25)"
                : "none",
            }}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke={composer.trim() ? "#0a0a0a" : "#888"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function Thread({
  messages,
  accent,
}: {
  messages: ViewMessage[];
  accent: string;
}) {
  // Group by day separator
  const grouped: { day: string; items: ViewMessage[] }[] = [];
  for (const m of messages) {
    const last = grouped[grouped.length - 1];
    if (last && last.day === m.day) last.items.push(m);
    else grouped.push({ day: m.day, items: [m] });
  }

  return (
    <div className="flex flex-col gap-1">
      {grouped.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-[#1d1d1d]" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-5">
              {group.day}
            </span>
            <div className="flex-1 h-px bg-[#1d1d1d]" />
          </div>

          {group.items.map((m, idx) => {
            const prev = group.items[idx - 1];
            const next = group.items[idx + 1];
            const isFirstInRun = !prev || prev.from !== m.from;
            const isLastInRun = !next || next.from !== m.from;
            return (
              <Bubble
                key={m.id}
                message={m}
                accent={accent}
                isFirstInRun={isFirstInRun}
                isLastInRun={isLastInRun}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Bubble({
  message,
  accent,
  isFirstInRun,
  isLastInRun,
}: {
  message: ViewMessage;
  accent: string;
  isFirstInRun: boolean;
  isLastInRun: boolean;
}) {
  const isMe = message.from === "me";

  // Tail radius: tighter on the side of the previous bubble in run
  const meRadius = isLastInRun ? "20px 20px 4px 20px" : "20px 20px 6px 20px";
  const themRadius = isLastInRun ? "20px 20px 20px 4px" : "20px 20px 20px 6px";

  return (
    <div
      className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
        isFirstInRun ? "mt-2" : "mt-[2px]"
      }`}
    >
      <div
        className={`max-w-[68%] px-4 py-2.5 text-[14px] leading-snug break-words ${
          isMe ? "text-ink" : "text-cream border-[0.5px] border-white/10"
        }`}
        style={{
          background: isMe
            ? "linear-gradient(180deg, #f5f5f0 0%, #e7e7e0 100%)"
            : "rgba(36,36,36,0.85)",
          borderRadius: isMe ? meRadius : themRadius,
          boxShadow: isMe
            ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.25)"
            : `0 0 0 0.5px ${accent}33, 0 2px 8px rgba(0,0,0,0.2)`,
          backdropFilter: isMe ? undefined : "blur(6px)",
        }}
      >
        {message.text}
      </div>
      {isLastInRun && (
        <span className="text-[10px] text-gray-5 mt-1 px-1">{message.time}</span>
      )}
    </div>
  );
}

function ChatEmpty({ conversation }: { conversation: Conversation }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div
        className="rounded-full flex items-center justify-center text-[36px] mb-5 border-[1.5px]"
        style={{
          width: 72,
          height: 72,
          background: "rgba(10,10,10,0.55)",
          borderColor: ACCENT_HEX[conversation.accent],
          boxShadow: `0 0 0 3px ${ACCENT_HEX[conversation.accent]}22, 0 0 24px ${ACCENT_HEX[conversation.accent]}44`,
        }}
      >
        <span>{conversation.emoji}</span>
      </div>
      <p className="font-syne text-[20px] text-cream font-extrabold mb-1 tracking-[-0.4px]">
        Say hi to {conversation.name}
      </p>
      <p className="text-[13px] text-gray-5 max-w-[320px]">
        Start a conversation. Mention what you saw on their profile — it goes a long way.
      </p>
    </div>
  );
}

function EmptyConv({
  loading,
  hasConversations,
}: {
  loading: boolean;
  hasConversations: boolean;
}) {
  return (
    <section className="flex-1 hidden md:flex flex-col items-center justify-center bg-ink text-center px-8">
      <div className="text-[48px] mb-4 inline-block animate-icon-glow">💬</div>
      <p className="font-syne text-[22px] text-cream font-extrabold mb-2 tracking-[-0.4px]">
        {loading
          ? "Loading…"
          : hasConversations
            ? "Select a conversation"
            : "No conversations yet"}
      </p>
      <p className="text-[13px] text-gray-5 max-w-[320px]">
        {hasConversations
          ? "Pick someone from the list to start chatting. Or go discover new crows."
          : "Match with other crows to start a conversation."}
      </p>
    </section>
  );
}
