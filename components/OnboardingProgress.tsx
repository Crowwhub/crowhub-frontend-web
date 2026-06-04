type Props = { current: number; total: number };

export default function OnboardingProgress({ current, total }: Props) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 w-7 rounded-full transition-colors ${
            i < current ? "bg-cream" : "bg-gray-3"
          }`}
        />
      ))}
    </div>
  );
}
