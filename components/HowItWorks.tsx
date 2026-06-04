const steps = [
  {
    num: "01",
    title: "Build your profile",
    desc: "Add your bio, skills, and links. Let people know who you are before they even follow.",
  },
  {
    num: "02",
    title: "Discover & follow",
    desc: "Browse by interest or location. Follow creators and professionals that inspire you.",
  },
  {
    num: "03",
    title: "Engage & grow",
    desc: "Post updates, message directly, join communities. Watch your network expand organically.",
  },
];

const showcase = [
  { initials: "PJ", name: "Priya Joshi", role: "UI Designer", tone: "sage" },
  { initials: "AV", name: "Arjun Verma", role: "Developer", tone: "amber" },
  { initials: "SM", name: "Sara Mehra", role: "Writer", tone: "sage" },
  { initials: "NK", name: "Neil Khanna", role: "Photographer", tone: "amber" },
] as const;

export default function HowItWorks() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-20">
      <div>
        <div className="text-[11px] tracking-[0.14em] uppercase text-gray-5 mb-4">
          How it works
        </div>
        <h2 className="font-syne text-[40px] font-bold tracking-[-1.5px] text-cream leading-[1.1] mb-12">
          Three steps
          <br />
          to your tribe
        </h2>
        <div>
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`step flex gap-5 py-6 cursor-default ${
                i < steps.length - 1
                  ? "border-b-[0.5px] border-gray-3"
                  : ""
              }`}
            >
              <div className="font-syne text-[11px] text-gray-4 tracking-[0.08em] min-w-[28px] pt-[3px]">
                {s.num}
              </div>
              <div>
                <div className="font-syne text-[15px] font-bold text-cream mb-1">
                  {s.title}
                </div>
                <p className="text-[13px] text-gray-5 leading-[1.6]">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-2 border-[0.5px] border-gray-3 rounded-3xl p-6">
        <div className="grid grid-cols-2 gap-3">
          {showcase.map((p) => (
            <div
              key={p.initials}
              className="bg-gray-1 border-[0.5px] border-gray-3 rounded-2xl p-4 flex items-center gap-[10px]"
            >
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-syne text-xs font-bold"
                style={
                  p.tone === "sage"
                    ? { background: "#1e2e22", color: "#6aab7a" }
                    : { background: "#2c1f0e", color: "#e09b45" }
                }
              >
                {p.initials}
              </div>
              <div>
                <div className="font-syne text-[13px] font-bold text-cream">
                  {p.name}
                </div>
                <div className="text-[11px] text-gray-5">{p.role}</div>
              </div>
              <button className="ml-auto bg-transparent border-[0.5px] border-gray-3 text-gray-5 rounded-full px-3 py-1 text-[11px] cursor-pointer whitespace-nowrap transition-colors hover:bg-cream hover:text-ink hover:border-cream">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
