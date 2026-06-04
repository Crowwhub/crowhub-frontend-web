type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  wide?: boolean;
};

const FICON_PROPS = {
  className: "w-5 h-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#f5f5f0",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const features: Feature[] = [
  {
    title: "Smart Profiles",
    desc: "Your identity, exactly as you want it. Showcase skills, work, and personality in one place — and let people understand who you are before the first message.",
    wide: true,
    icon: (
      <svg {...FICON_PROPS}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Live Discovery",
    desc: "Find people who matter in real time. Filter by interest, location, or expertise.",
    icon: (
      <svg {...FICON_PROPS}>
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Direct Messaging",
    desc: "Clean, fast, no clutter. Have real conversations with the people you follow.",
    icon: (
      <svg {...FICON_PROPS}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Growth Analytics",
    desc: "Know who's engaging with your profile and track your community over time.",
    icon: (
      <svg {...FICON_PROPS}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Privacy Controls",
    desc: "You own your data. Granular privacy settings so you connect on your terms.",
    icon: (
      <svg {...FICON_PROPS}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-gray-4" />
        <span className="text-[11px] tracking-[0.18em] uppercase text-gray-5">
          Features
        </span>
      </div>
      <h2 className="font-syne text-[40px] md:text-[52px] font-bold tracking-[-2px] text-cream leading-[1.05] mb-14">
        Everything you need
        <br />
        to grow your flock
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className={`bg-gray-1 border-[0.5px] border-gray-3 rounded-[20px] p-8 transition-colors hover:bg-gray-2 ${
              f.wide ? "md:col-span-2 md:row-span-1" : ""
            }`}
          >
            <div className="w-10 h-10 bg-gray-2 border-[0.5px] border-gray-3 rounded-xl flex items-center justify-center mb-5">
              {f.icon}
            </div>
            <div
              className={`font-syne font-bold text-cream mb-2 ${
                f.wide ? "text-[22px]" : "text-base"
              }`}
            >
              {f.title}
            </div>
            <p
              className={`text-gray-5 leading-[1.6] ${
                f.wide ? "text-[14px] max-w-[420px]" : "text-[13px]"
              }`}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
