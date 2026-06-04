"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

/* ============================================================ Types & data */

type Accent = "sage" | "amber";

type Conversation = {
  id: string;
  name: string;
  emoji: string;
  accent: Accent;
  role: string;
  company: string;
  intent: "Project Collab" | "Hiring" | "Referral" | "Networking";
  online: boolean;
  unread: number;
};

type Message = {
  id: string;
  convId: string;
  from: "me" | "them";
  text: string;
  time: string;
  day: string;
};

const ACCENT_HEX: Record<Accent, string> = {
  sage: "#6aab7a",
  amber: "#e09b45",
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "m1",
    name: "Aarav Mehta",
    emoji: "🐦‍⬛",
    accent: "sage",
    role: "Product Designer",
    company: "Zyra Labs",
    intent: "Project Collab",
    online: true,
    unread: 2,
  },
  {
    id: "m2",
    name: "Tara Singh",
    emoji: "🦉",
    accent: "amber",
    role: "CTO",
    company: "Lensit",
    intent: "Hiring",
    online: true,
    unread: 0,
  },
  {
    id: "m3",
    name: "Priya Joshi",
    emoji: "🦢",
    accent: "sage",
    role: "UI Designer",
    company: "Freelance",
    intent: "Networking",
    online: false,
    unread: 1,
  },
  {
    id: "m5",
    name: "Maya Bhatt",
    emoji: "🐧",
    accent: "sage",
    role: "Visual Designer",
    company: "Studio Six",
    intent: "Networking",
    online: false,
    unread: 0,
  },
  {
    id: "m6",
    name: "Sara Mehra",
    emoji: "🦜",
    accent: "amber",
    role: "Long-form Writer",
    company: "Wired",
    intent: "Project Collab",
    online: true,
    unread: 3,
  },
  {
    id: "m8",
    name: "Kavya Iyer",
    emoji: "🦆",
    accent: "amber",
    role: "Data Scientist",
    company: "Acuity Health",
    intent: "Hiring",
    online: false,
    unread: 0,
  },
];

const SEED_MESSAGES: Message[] = [
  // m1 — Aarav
  { id: "x1", convId: "m1", from: "them", text: "Hey! Saw your profile on CrowHub — love your design work.", time: "10:24 AM", day: "Yesterday" },
  { id: "x2", convId: "m1", from: "me", text: "Thanks Aarav, appreciate that 🙌", time: "10:31 AM", day: "Yesterday" },
  { id: "x3", convId: "m1", from: "them", text: "We're building a payments product at Zyra and could use a hand on the onboarding flow. Open to a quick call this week?", time: "10:32 AM", day: "Yesterday" },
  { id: "x4", convId: "m1", from: "me", text: "Yeah I'd love to. What does your Thursday afternoon look like?", time: "9:02 AM", day: "Today" },
  { id: "x5", convId: "m1", from: "them", text: "Thursday 3pm works for me!", time: "9:14 AM", day: "Today" },
  { id: "x6", convId: "m1", from: "them", text: "I'll drop a calendar invite later today.", time: "9:14 AM", day: "Today" },

  // m2 — Tara
  { id: "y1", convId: "m2", from: "them", text: "Hi! We're hiring senior engineers at Lensit — would love your help with referrals.", time: "Tue", day: "This week" },
  { id: "y2", convId: "m2", from: "me", text: "Happy to share. What's the stack?", time: "Tue", day: "This week" },
  { id: "y3", convId: "m2", from: "them", text: "Go on the backend, React + TS on the front. Anyone in your network in Bangalore?", time: "Tue", day: "This week" },

  // m3 — Priya
  { id: "z1", convId: "m3", from: "them", text: "Hey! Loved your portfolio.", time: "Mon", day: "This week" },
  { id: "z2", convId: "m3", from: "me", text: "Thank you Priya 🙏", time: "Mon", day: "This week" },
  { id: "z3", convId: "m3", from: "them", text: "Quick question — how do you handle clients who want endless revisions?", time: "Mon", day: "This week" },

  // m5 — Maya (empty)

  // m6 — Sara
  { id: "w1", convId: "m6", from: "them", text: "Hi! I'm working on a piece about indie design studios in India.", time: "Sun", day: "Last week" },
  { id: "w2", convId: "m6", from: "them", text: "Would love to quote you. Got 10 min for a phone interview?", time: "Sun", day: "Last week" },
  { id: "w3", convId: "m6", from: "them", text: "👋 Bumping in case you missed this!", time: "9:15 AM", day: "Today" },

  // m8 — Kavya
  { id: "v1", convId: "m8", from: "them", text: "Hello! I came across your data viz work — really clean.", time: "May 18", day: "Earlier" },
  { id: "v2", convId: "m8", from: "me", text: "Thanks Kavya, that means a lot.", time: "May 18", day: "Earlier" },
];

const INTENT_BADGE: Record<Conversation["intent"], string> = {
  "Project Collab": "Collab",
  Hiring: "Hiring",
  Referral: "Referral",
  Networking: "Networking",
};

/* ============================================================ Page */

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialWith = searchParams?.get("with") ?? null;

  const [conversations, setConversations] =
    useState<Conversation[]>(CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [composer, setComposer] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialWith && CONVERSATIONS.some((c) => c.id === initialWith))
      return initialWith;
    return CONVERSATIONS[0]?.id ?? null;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const convMessages = useMemo(
    () => messages.filter((m) => m.convId === selectedId),
    [messages, selectedId]
  );

  const lastByConv = useMemo(() => {
    const map: Record<string, Message> = {};
    for (const m of messages) {
      map[m.convId] = m;
    }
    return map;
  }, [messages]);

  const filteredConvs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      [c.name, c.role, c.company].some((s) => s.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages.length]);

  useEffect(() => {
    if (!selectedId) return;
    setConversations((cs) =>
      cs.map((c) => (c.id === selectedId ? { ...c, unread: 0 } : c))
    );
  }, [selectedId]);

  function sendMessage() {
    const text = composer.trim();
    if (!text || !selectedId) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      convId: selectedId,
      from: "me",
      text,
      time,
      day: "Today",
    };
    setMessages((prev) => [...prev, newMsg]);
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
          search={search}
          setSearch={setSearch}
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
          <EmptyConv />
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
  search,
  setSearch,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  lastByConv: Record<string, Message>;
  search: string;
  setSearch: (v: string) => void;
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
        {conversations.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12px] text-gray-5">
            No conversations.
          </div>
        ) : (
          conversations.map((c) => (
            <ConvListRow
              key={c.id}
              conversation={c}
              isSelected={c.id === selectedId}
              lastMessage={lastByConv[c.id]}
              onClick={() => onSelect(c.id)}
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
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  lastMessage?: Message;
  onClick: () => void;
}) {
  const accent = ACCENT_HEX[conversation.accent];
  const preview = lastMessage
    ? (lastMessage.from === "me" ? "You: " : "") + lastMessage.text
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
        {conversation.online && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink"
            style={{ background: "#6aab7a" }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-syne text-[14.5px] font-bold text-cream truncate tracking-[-0.2px]">
            {conversation.name}
          </span>
          <span className="text-[10px] text-gray-5 whitespace-nowrap flex-shrink-0">
            {lastMessage?.time ?? ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-[12px] truncate flex-1 ${
              conversation.unread > 0 && !isSelected
                ? "text-cream"
                : "text-gray-5"
            }`}
          >
            {preview}
          </p>
          {conversation.unread > 0 && !isSelected && (
            <span
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold text-ink flex-shrink-0"
              style={{ background: "#6aab7a" }}
            >
              {conversation.unread}
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
  messages: Message[];
  composer: string;
  setComposer: (v: string) => void;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  composerRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const accent = ACCENT_HEX[conversation.accent];

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
          <div className="text-[11.5px] text-gray-5 leading-tight">
            {conversation.role} at {conversation.company}
            <span className="text-gray-4 mx-1.5">·</span>
            <span className="text-cream font-medium">
              {INTENT_BADGE[conversation.intent]}
            </span>
            {conversation.online && (
              <>
                <span className="text-gray-4 mx-1.5">·</span>
                <span style={{ color: ACCENT_HEX.sage }}>● Active now</span>
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

function Thread({ messages, accent }: { messages: Message[]; accent: string }) {
  // Group by day separator
  const grouped: { day: string; items: Message[] }[] = [];
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
  message: Message;
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
          isMe
            ? "text-ink"
            : "text-cream border-[0.5px] border-white/10"
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
        <span className="text-[10px] text-gray-5 mt-1 px-1">
          {message.time}
        </span>
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

function EmptyConv() {
  return (
    <section className="flex-1 hidden md:flex flex-col items-center justify-center bg-ink text-center px-8">
      <div className="text-[48px] mb-4 inline-block animate-icon-glow">💬</div>
      <p className="font-syne text-[22px] text-cream font-extrabold mb-2 tracking-[-0.4px]">
        Select a conversation
      </p>
      <p className="text-[13px] text-gray-5 max-w-[320px]">
        Pick someone from the list to start chatting. Or go discover new crows.
      </p>
    </section>
  );
}
