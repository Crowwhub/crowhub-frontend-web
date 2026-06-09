"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ApiError, api, getToken, setToken } from "@/lib/api";

type AuthStatus = "loading" | "guest" | "authed";

// Mirror of Sidebar.logout() cleanup — keep these in sync.
function clearAuth() {
  try {
    setToken(null);
    localStorage.removeItem("crowhub:name");
    localStorage.removeItem("crowhub:avatar");
    localStorage.removeItem("crowhub:profile");
    localStorage.removeItem("crowhub:sounds");
    localStorage.removeItem("crowhub:notifications:unread");
    localStorage.removeItem("crowhub:requests:pending");
  } catch {}
}

export default function Nav() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🐦‍⬛");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("guest");
      return;
    }
    // Optimistically show logged-in using cached identity…
    try {
      setName(localStorage.getItem("crowhub:name") ?? "");
      setAvatar(localStorage.getItem("crowhub:avatar") ?? "🐦‍⬛");
    } catch {}
    setStatus("authed");

    // …then confirm the token is still valid and refresh name/avatar.
    let cancelled = false;
    api.me
      .get()
      .then((me) => {
        if (cancelled) return;
        if (me.name) {
          setName(me.name);
          try {
            localStorage.setItem("crowhub:name", me.name);
          } catch {}
        }
        if (me.avatar) {
          setAvatar(me.avatar);
          try {
            localStorage.setItem("crowhub:avatar", me.avatar);
          } catch {}
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // Only log out on a real auth failure — keep cache through network errors.
        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
          setStatus("guest");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the dropdown on outside click.
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

  function logout() {
    clearAuth();
    setStatus("guest");
    setMenuOpen(false);
  }

  return (
    <div className="sticky top-4 z-50 mt-6 mb-10 px-4 flex justify-center">
      <nav className="w-full max-w-[700px] flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-5 py-2.5 rounded-2xl border-[0.5px] border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <Link
          href="/"
          className="flex items-center gap-2 font-syne font-extrabold text-[18px] tracking-[-0.5px] text-cream shrink-0"
        >
          <img
            src="/crowhub_logo.png"
            alt="CrowHub logo"
            width={28}
            height={28}
            className="rounded-full"
          />
          Crow<span className="text-gray-5">Hub</span>
        </Link>
        <ul className="hidden md:flex gap-6 list-none">
          {["Discover", "Connect", "Pricing", "Blog"].map((item) => (
            <li key={item}>
              <a
                href="#"
                className="text-gray-5 text-[13px] transition-colors hover:text-cream"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Auth slot */}
        {status === "loading" ? (
          <div
            className="h-[36px] w-[96px] rounded-full bg-white/[0.04] border-[0.5px] border-white/10 animate-pulse"
            aria-hidden="true"
          />
        ) : status === "guest" ? (
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <Link
              href="/auth/login"
              className="text-gray-5 text-[13px] transition-colors hover:text-cream whitespace-nowrap"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="text-cream border-[0.5px] border-white/25 px-3.5 sm:px-[18px] py-2 rounded-full text-[13px] font-medium cursor-pointer bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-150 hover:from-white/30 hover:to-white/10 hover:scale-[0.97] whitespace-nowrap"
            >
              Join now →
            </Link>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border-[0.5px] border-white/15 bg-white/[0.05] backdrop-blur-md transition-colors hover:bg-white/[0.09]"
            >
              <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[15px] bg-gray-1/70 border-[0.5px] border-white/15">
                {avatar}
              </span>
              <span className="text-cream text-[13px] font-medium max-w-[120px] truncate">
                {name || "Account"}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-gray-5 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-[180px] rounded-2xl border-[0.5px] border-white/10 bg-gray-1/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-1.5 z-50"
              >
                <Link
                  href="/home"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-cream hover:bg-white/[0.06] transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Open app
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-gray-5 hover:text-cream hover:bg-white/[0.06] transition-colors"
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
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
