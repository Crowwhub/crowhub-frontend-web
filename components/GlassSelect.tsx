"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  id?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  // When searchable + the query matches no option, show an "Add" button
  // that calls onChange with the typed value.
  allowCustom?: boolean;
};

export default function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  id,
  searchable = false,
  searchPlaceholder = "Search…",
  allowCustom = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // The dropdown is portaled to <body> with fixed positioning so it escapes the
  // card stacking contexts (backdrop-blur) that would otherwise paint over it.
  function positionToTrigger() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 8, left: r.left, width: r.width });
  }

  function toggleOpen() {
    if (!open) positionToTrigger();
    setOpen((o) => !o);
  }

  // Keep the dropdown glued to the trigger on scroll/resize.
  useEffect(() => {
    if (!open) return;
    positionToTrigger();
    const onMove = () => positionToTrigger();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  // Close on outside click (trigger and the portaled menu both count as inside).
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      // Only auto-focus on fine pointers (desktop). On touch devices, focusing
      // pops the soft keyboard, and the first tap on an option then gets
      // consumed dismissing the keyboard instead of selecting.
      const coarsePointer =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches;
      if (!coarsePointer) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
    if (!open) setQuery("");
  }, [open, searchable]);

  const selected =
    options.find((o) => o.value === value) ??
    (allowCustom && value ? { value, label: value } : undefined);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  function choose(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-sm outline-none transition-colors hover:border-white/20 focus:border-white/30 flex items-center justify-between"
      >
        <span className={selected ? "text-cream" : "text-gray-4"}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {mounted && open && rect &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              top: rect.top,
              left: rect.left,
              width: rect.width,
              zIndex: 1000,
            }}
            className="rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] p-1.5"
          >
            {searchable && (
              <div className="px-2 pt-1 pb-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-gray-1/70 border-[0.5px] border-white/10 rounded-full px-4 py-2 text-sm text-cream outline-none placeholder:text-gray-4 focus:border-white/30"
                />
              </div>
            )}
            <div className="max-h-[220px] overflow-y-auto">
              {filtered.length === 0 ? (
                allowCustom && query.trim() ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(query.trim())}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-cream hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <span className="text-gray-4">+</span>
                    Add &ldquo;{query.trim()}&rdquo;
                  </button>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-5">No matches</div>
                )
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(opt.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                        isSelected
                          ? "bg-white/10 text-cream"
                          : "text-gray-5 hover:bg-white/5 hover:text-cream"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
