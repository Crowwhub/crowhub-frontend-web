const items = [
  "Find collaborators",
  "Connect beyond",
  "Discover people",
  "Build communities",
  "Share your work",
  "Grow your network",
];

type Props = { variant?: "outer" | "inner" };

export default function Ticker({ variant = "outer" }: Props) {
  const loop = [...items, ...items];
  const isInner = variant === "inner";

  return (
    <div
      className={`overflow-hidden border-y border-[#222] py-[10px] ${
        isInner ? "bg-ink" : "bg-ink"
      }`}
    >
      <div className="flex gap-12 animate-ticker whitespace-nowrap w-max">
        {loop.map((label, i) => (
          <span
            key={i}
            className={`text-[11px] tracking-[0.18em] uppercase flex items-center gap-4 ${
              isInner ? "text-gray-5" : "text-gray-4"
            }`}
          >
            {label}
            {isInner ? <CrowFootDivider /> : <DiamondDivider />}
          </span>
        ))}
      </div>
    </div>
  );
}

function DiamondDivider() {
  return (
    <svg
      className="w-2 h-2 text-gray-4"
      viewBox="0 0 8 8"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="4,0 8,4 4,8 0,4" />
    </svg>
  );
}

function CrowFootDivider() {
  return (
    <svg
      className="w-3.5 h-3 text-gray-5"
      viewBox="0 0 16 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="8" y1="2" x2="2" y2="10" />
      <line x1="8" y1="2" x2="8" y2="11" />
      <line x1="8" y1="2" x2="14" y2="10" />
    </svg>
  );
}
