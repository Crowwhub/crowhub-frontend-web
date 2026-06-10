import type { ShowcaseItem } from "@/lib/api";

// Renders a person's showcase entries (title, type, description, link) — used
// in the discover detail modal and the match profile modal.
export default function ShowcaseList({ items }: { items: ShowcaseItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl border-[0.5px] border-white/10 bg-gray-1/50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="font-syne text-[14px] font-bold text-cream leading-snug">
              {s.title}
            </div>
            {s.type && (
              <span className="flex-shrink-0 text-[10px] uppercase tracking-[0.12em] text-sage-light border-[0.5px] border-sage-light/40 bg-sage-light/[0.08] px-2 py-0.5 rounded-full">
                {s.type}
              </span>
            )}
          </div>
          {s.description && (
            <p className="text-[12.5px] text-gray-5 leading-[1.5] mt-1.5">
              {s.description}
            </p>
          )}
          {s.link && (
            <a
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-sage-light hover:underline mt-2 break-all"
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {s.link.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
