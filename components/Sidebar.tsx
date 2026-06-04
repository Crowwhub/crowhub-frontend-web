"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CrowSvg from "./CrowSvg";
import { api, setToken } from "@/lib/api";

type Item = {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  href?: string;
  badge?: number;
  unread?: boolean;
  onClick?: () => void;
};

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const [name, setName] = useState("Subham");
  const [avatar, setAvatar] = useState("🐦‍⬛");
  const [unread, setUnread] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load identity
  useEffect(() => {
    try {
      const n = localStorage.getItem("crowhub:name");
      if (n) setName(n);
      const a = localStorage.getItem("crowhub:avatar");
      if (a) setAvatar(a);
    } catch {}
  }, []);

  // Poll pending swipe requests every 30s.
  useEffect(() => {
    let cancelled = false;
    async function fetchRequests() {
      try {
        const requests = await api.swipes.requests();
        if (!cancelled) setPendingRequests(requests.length);
      } catch {
        // unauth or backend down — leave count alone.
      }
    }
    fetchRequests();
    const id = window.setInterval(fetchRequests, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Subscribe to notification badge
  useEffect(() => {
    function refresh() {
      try {
        const raw = localStorage.getItem("crowhub:notifications:unread");
        const n = raw === null ? NaN : Number(raw);
        setUnread(Number.isFinite(n) && n > 0 ? n : 0);
      } catch {
        setUnread(0);
      }
    }
    refresh();
    window.addEventListener("crowhub:notifications-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("crowhub:notifications-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Click outside for the bottom menu
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const topNav: Item[] = [
    {
      id: "home",
      label: "Home",
      icon: (a) => <HomeIcon active={a} />,
      href: "/home",
    },
    {
      id: "chat",
      label: "Chat",
      icon: (a) => <ChatIcon active={a} />,
      href: "/chat",
      unread: true,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (a) => <BellIcon active={a} />,
      href: "/notifications",
      badge: unread,
    },
    {
      id: "requests",
      label: "Requests",
      icon: (a) => <RequestsIcon active={a} />,
      href: "/requests",
      badge: pendingRequests,
    },
    {
      id: "matches",
      label: "Matches",
      icon: (a) => <MatchesIcon active={a} />,
      href: "/matches",
    },
  ];

  const bottomNav: Item[] = [
    {
      id: "profile",
      label: "Profile",
      icon: (a) => <UserIcon active={a} />,
      href: "/profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: (a) => <SettingsIcon active={a} />,
    },
  ];

  function isActive(item: Item) {
    return !!item.href && pathname.startsWith(item.href);
  }

  const initial = name.trim().charAt(0).toUpperCase() || "C";
  const handle = "@" + name.toLowerCase().replace(/\s+/g, "");

  function logout() {
    try {
      setToken(null);
      localStorage.removeItem("crowhub:name");
      localStorage.removeItem("crowhub:avatar");
      localStorage.removeItem("crowhub:profile");
      localStorage.removeItem("crowhub:sounds");
      localStorage.removeItem("crowhub:notifications:unread");
      localStorage.removeItem("crowhub:requests:pending");
    } catch {}
    window.location.href = "/auth/login";
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] flex-col py-6 px-3 border-r border-[#1a1a1a] bg-ink z-30">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3 py-2 mb-7 group"
      >
        <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
          <CrowSvg
            width={22}
            height={20}
            bodyFill="#f5f5f0"
            wingFill="#aaaaaa"
            detailFill="#888888"
            accent="#6aab7a"
            showPerch={false}
          />
        </div>
        <div className="font-syne font-extrabold text-[22px] tracking-[-0.5px] text-cream">
          Crow<span className="text-gray-5">Hub</span>
        </div>
      </Link>

      {/* Top nav */}
      <nav className="flex flex-col gap-2">
        {topNav.map((item) => (
          <Row key={item.id} item={item} active={isActive(item)} />
        ))}
      </nav>

      {/* Divider */}
      <div className="my-4 h-px bg-[#1e1e1e]" />

      {/* Bottom nav */}
      <nav className="flex flex-col gap-2">
        {bottomNav.map((item) => (
          <Row key={item.id} item={item} active={isActive(item)} />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User chip */}
      <div ref={menuRef} className="relative">
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl p-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-gray-5 hover:text-cream hover:bg-white/[0.05] transition-colors flex items-center gap-2"
            >
              <SwitchIcon />
              Switch account
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-[#e08080] hover:bg-[#e08080]/[0.08] transition-colors flex items-center gap-2"
            >
              <LogoutIcon />
              Log out @{handle.replace("@", "")}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Account menu"
          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/[0.04] transition-colors"
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[16px] font-syne font-bold border-[0.5px] border-white/15"
            style={{
              background:
                "linear-gradient(135deg, rgba(106,171,122,0.35), rgba(224,155,69,0.25))",
              color: "#f5f5f0",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <span aria-hidden="true">{avatar || initial}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13.5px] font-bold text-cream truncate leading-tight">
              {name}
            </div>
            <div className="text-[11.5px] text-gray-5 truncate leading-tight">
              {handle}
            </div>
          </div>
          <span className="flex-shrink-0 text-gray-5 text-[18px] leading-none">
            ···
          </span>
        </button>
      </div>
    </aside>
  );
}

/* ============================================================ Row */

function Row({ item, active }: { item: Item; active: boolean }) {
  const baseClass =
    "group relative flex items-center gap-2.5 h-[48px] px-3 rounded-2xl transition-all duration-150 outline-none";
  const activeClass =
    "bg-[#1e1e1e] border-[0.5px] border-[#2e2e2e] text-cream";
  const inactiveClass =
    "border-[0.5px] border-transparent text-[#666] hover:text-[#d8d8d8] hover:bg-[#161616] hover:shadow-[inset_2px_0_0_#333]";

  const content = (
    <>
      {active && <CrowFootMark />}
      <span
        className={`relative w-[22px] h-[22px] flex items-center justify-center transition-transform duration-150 ${
          active ? "" : "group-hover:scale-[1.06]"
        }`}
      >
        {item.icon(active)}
        {item.unread && !item.badge && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sage-light shadow-[0_0_6px_rgba(106,171,122,0.7)]"
          />
        )}
      </span>
      <span className="flex-1 text-[15px] font-medium tracking-[-0.1px]">
        {item.label}
      </span>
      {item.badge ? (
        <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px] font-bold text-ink bg-sage-light shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}
    </>
  );

  const cls = `${baseClass} ${active ? activeClass : inactiveClass}`;

  if (item.href) {
    return (
      <Link href={item.href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={item.onClick} className={cls}>
      {content}
    </button>
  );
}

function CrowFootMark() {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      stroke="#f5f5f0"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="absolute -left-[3px] top-1/2 -translate-y-1/2 drop-shadow-[0_0_4px_rgba(245,245,240,0.35)]"
    >
      <line x1="5" y1="2" x2="1" y2="14" />
      <line x1="5" y1="2" x2="5" y2="15" />
      <line x1="5" y1="2" x2="9" y2="14" />
    </svg>
  );
}

/* ============================================================ Icons */

function iconProps(active: boolean) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.1 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-[22px] h-[22px]",
  };
}

function HomeIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  if (active) {
    return (
      <svg {...p} fill="currentColor" stroke="currentColor" strokeWidth={1}>
        <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10.5" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  if (active) {
    return (
      <svg {...p} fill="currentColor" stroke="currentColor" strokeWidth={1}>
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function BellIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  if (active) {
    return (
      <svg {...p} fill="currentColor" stroke="currentColor" strokeWidth={1}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function RequestsIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  if (active) {
    return (
      <svg {...p} fill="currentColor" stroke="currentColor" strokeWidth={1}>
        <path d="M4 4h12l4 4v12a0 0 0 0 1 0 0H4z" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function MatchesIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  if (active) {
    return (
      <svg {...p} fill="currentColor" stroke="currentColor" strokeWidth={1}>
        <circle cx="9" cy="7" r="4" />
        <circle cx="17" cy="9" r="3" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        <path d="M16 14a3 3 0 0 1 3 3v1" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  if (active) {
    return (
      <svg {...p} fill="currentColor" stroke="currentColor" strokeWidth={1}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const p = iconProps(active);
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v3" />
      <path d="M12 20v3" />
      <path d="M4.22 4.22l2.12 2.12" />
      <path d="M17.66 17.66l2.12 2.12" />
      <path d="M1 12h3" />
      <path d="M20 12h3" />
      <path d="M4.22 19.78l2.12-2.12" />
      <path d="M17.66 6.34l2.12-2.12" />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
