"use client";

import type React from "react";

export default function LikeHeart({
  active,
  accent = "#6aab7a",
  size = 13,
  onClick,
  position,
  className,
  inline,
}: {
  active: boolean;
  accent?: string;
  size?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  position?: "absolute";
  className?: string;
  inline?: boolean;
}) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={active ? accent : "none"}
      stroke={active ? accent : "#888"}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: active ? `drop-shadow(0 0 6px ${accent}88)` : "none",
        transition: "all 150ms",
        transform: active ? "scale(1.05)" : "scale(1)",
      }}
      aria-hidden="true"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );

  if (inline) {
    return (
      <span
        role="button"
        tabIndex={0}
        aria-pressed={active}
        aria-label={active ? "Remove like" : "Like"}
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }
        }}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }
        }}
        className="inline-flex items-center justify-center transition-transform duration-150 hover:scale-[1.18] cursor-pointer"
      >
        {svg}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove like" : "Like"}
      className={`${
        position === "absolute" ? "absolute" : ""
      } w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-[1.12] cursor-pointer ${
        className ?? ""
      }`}
    >
      {svg}
    </button>
  );
}
