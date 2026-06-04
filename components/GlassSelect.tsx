"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      // Defer so the input is mounted before we focus.
      requestAnimationFrame(() => inputRef.current?.focus());
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
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

      {open && (
        <div
          role="listbox"
          className="absolute z-30 top-[calc(100%+8px)] left-0 right-0 rounded-2xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] p-1.5"
        >
          {searchable && (
            <div className="px-2 pt-1 pb-2 sticky top-0">
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
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                  }}
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
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
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
        </div>
      )}
    </div>
  );
}
