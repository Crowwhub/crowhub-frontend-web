import Link from "next/link";

/* Small profile chips scattered around the hero, connected by the faint
   network arcs behind them — evokes "people in your network". */
const ORBIT_AVATARS: {
  emoji: string;
  pos: string;
  float: "a" | "b";
  accent: string;
}[] = [
  { emoji: "🦅", pos: "top-[14%] left-[8%]", float: "a", accent: "#6aab7a" },
  { emoji: "🦜", pos: "top-[30%] right-[7%]", float: "b", accent: "#e09b45" },
  { emoji: "🕊️", pos: "top-[8%] right-[20%]", float: "a", accent: "#6aab7a" },
  { emoji: "🐦", pos: "bottom-[34%] left-[5%]", float: "b", accent: "#e09b45" },
  { emoji: "🦢", pos: "bottom-[20%] right-[10%]", float: "a", accent: "#6aab7a" },
  { emoji: "🐧", pos: "top-[46%] left-[14%]", float: "b", accent: "#e09b45" },
];

/* Live-feeling activity, in CrowHub's voice (mirrors the kinds of events the
   notification system actually produces). */
const ACTIVITY: {
  icon: string;
  text: string;
  time: string;
  accent: string;
  pos: string;
  float: "a" | "b";
}[] = [
  {
    icon: "🤝",
    text: "Matched a designer with a founder",
    time: "2 min ago",
    accent: "#6aab7a",
    pos: "bottom-[18%] -left-[2%] sm:left-[4%]",
    float: "a",
  },
  {
    icon: "✨",
    text: "Connected a student to a mentor",
    time: "4 min ago",
    accent: "#e09b45",
    pos: "bottom-[34%] -right-[2%] sm:right-[3%]",
    float: "b",
  },
];

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center text-center pt-6 pb-16 min-h-[80vh] overflow-hidden">
      {/* ---- Network backdrop: faint orbit arcs + scattered avatars ---- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <g stroke="rgba(245,245,240,0.07)" strokeWidth="1">
            <ellipse cx="500" cy="380" rx="430" ry="300" />
            <ellipse cx="500" cy="380" rx="300" ry="210" />
            <ellipse cx="500" cy="380" rx="170" ry="120" />
          </g>
          <g fill="rgba(245,245,240,0.10)">
            <circle cx="70" cy="380" r="3" />
            <circle cx="930" cy="380" r="3" />
            <circle cx="500" cy="80" r="3" />
            <circle cx="500" cy="680" r="3" />
            <circle cx="220" cy="170" r="2.5" />
            <circle cx="800" cy="600" r="2.5" />
          </g>
        </svg>

        {ORBIT_AVATARS.map((a) => (
          <div
            key={a.emoji + a.pos}
            className={`absolute ${a.pos} w-[44px] h-[44px] rounded-2xl flex items-center justify-center text-[20px] border-[0.5px] border-white/10 bg-gray-2/80 backdrop-blur-sm shadow-[0_8px_20px_rgba(0,0,0,0.4)] animate-hero-float-${a.float}`}
            style={{
              boxShadow: `0 8px 20px rgba(0,0,0,0.4), inset 0 0 0 1px ${a.accent}22`,
            }}
          >
            <span aria-hidden="true">{a.emoji}</span>
          </div>
        ))}
      </div>

      {/* ---- Eyebrow ---- */}
      <div className="relative z-10 inline-flex items-center gap-2 bg-gray-2 border-[0.5px] border-gray-3 rounded-full px-[14px] py-[6px] text-[11px] text-gray-5 tracking-[0.14em] uppercase mb-7">
        <div className="w-[6px] h-[6px] bg-sage-light rounded-full animate-pulse-dot" />
        Intent-first people discovery
      </div>

      {/* ---- Headline ---- */}
      <h1
        className="relative z-10 font-cabinet font-black text-cream mb-5"
        style={{
          fontSize: "clamp(32px, 7.4vw, 84px)",
          lineHeight: 0.92,
          letterSpacing: "-0.04em",
        }}
      >
        Hi, I’m Mr Crow
        <br />
        <span className="text-[#555]">from CrowHub.</span>
      </h1>

      {/* ---- Subhead ---- */}
      <div className="relative z-10 max-w-[540px] mb-3 px-4">
        <p className="text-[17px] text-cream/90 leading-[1.55] font-medium">
          Tell me your intention and domain you are looking for — and I’ll find
          your people to swipe through.
        </p>
        <p className="mt-3 text-[14px] text-gray-5 leading-[1.6] font-light">
          People who share your goals, interests, and intent — to learn,
          collaborate, grow, ask referrals , get hired or simply connect.
        </p>
      </div>

      {/* ---- Mascot + floating activity cards ---- */}
      <div className="relative z-10 w-full flex justify-center -mt-4 sm:-mt-10 mb-6">
        {/* soft glow seating the mascot */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(106,171,122,0.35), rgba(224,155,69,0.18) 45%, transparent 70%)",
          }}
        />

        {/* Mobile-only partial orbit rings behind the mascot. The wide ring is
            clipped by the section's overflow-hidden → reads as a partial orbit.
            Desktop uses the full network backdrop above instead. */}
        <div
          aria-hidden="true"
          className="sm:hidden pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-0 w-[340px] h-[340px] rounded-full border border-white/[0.10]"
        />
        <div
          aria-hidden="true"
          className="sm:hidden pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-0 w-[500px] h-[500px] rounded-full border border-white/[0.05]"
        >
          {/* a couple of faint nodes on the outer ring */}
          <span className="absolute top-1/2 -left-[3px] w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="absolute -top-[3px] left-[30%] w-1.5 h-1.5 rounded-full bg-white/15" />
          <span className="absolute top-[64%] -right-[3px] w-1.5 h-1.5 rounded-full bg-white/15" />
        </div>

        <div className="relative w-full max-w-[680px] flex justify-center">
          {/* Transparent-background mascot at public/crow-hero.png — floats
              directly on the page, no crop/mask needed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/crow-hero.png"
            alt="CrowHub mascot"
            className="relative z-[1] w-[clamp(360px,88vw,820px)] h-auto select-none"
            draggable={false}
            style={{
              // Fade the lower body into the page so the cutout doesn't read as
              // a pasted image — the crow appears to emerge from the background.
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 72%, transparent 97%)",
              maskImage:
                "linear-gradient(to bottom, #000 72%, transparent 97%)",
            }}
          />

          {/* Activity cards (sm+ only — too cramped on mobile) */}
          {ACTIVITY.map((c) => (
            <div
              key={c.text}
              className={`hidden sm:flex absolute ${c.pos} z-[2] items-start gap-3 w-[230px] rounded-2xl border-[0.5px] border-white/10 bg-gray-2/70 backdrop-blur-md p-3.5 text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] animate-hero-float-${c.float}`}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[15px] border-[0.5px] border-white/10"
                style={{ background: `${c.accent}22` }}
                aria-hidden="true"
              >
                {c.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-cream leading-snug">
                  {c.text}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.accent }}
                  />
                  {c.time}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- CTAs ---- */}
      <div className="relative z-10 flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/auth"
          className="text-cream border-[0.5px] border-white/30 px-7 py-[13px] rounded-full text-[15px] font-medium cursor-pointer inline-flex items-center gap-2 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.97]"
        >
          Find Your Crows →
        </Link>
        <Link
          href="/why"
          className="animate-btn-glow text-cream border-[0.5px] border-sage-light/50 bg-sage-light/[0.06] px-7 py-[13px] rounded-full text-[15px] font-medium cursor-pointer transition-all duration-150 hover:border-sage-light hover:bg-sage-light/[0.12] hover:scale-[0.98]"
        >
          Why CrowHub?
        </Link>
      </div>
    </section>
  );
}
