import Link from "next/link";
import CrowSvg from "./CrowSvg";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10 lg:gap-20 items-start min-h-[60vh] lg:min-h-[88vh] pt-10 pb-16">
      <div className="min-w-0 overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-gray-2 border-[0.5px] border-gray-3 rounded-full px-[14px] py-[6px] text-[11px] text-gray-5 tracking-[0.14em] uppercase mb-6">
          <div className="w-[6px] h-[6px] bg-gray-5 rounded-full animate-pulse-dot" />
          Now in open beta
        </div>
        <h1
          className="font-syne font-extrabold text-cream mb-6"
          style={{
            fontSize: "clamp(40px, 4.6vw, 64px)",
            lineHeight: 1.0,
            letterSpacing: "-2px",
          }}
        >
          Connect
          <br />
          <span className="text-[#555]">Beyond</span>
          <br />
          Boundaries
        </h1>
        <p className="text-[15px] text-gray-5 leading-[1.6] max-w-[400px] mb-5 font-light">
          CrowHub brings real people together. Build your network, follow
          creators, and discover communities that matter to you.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/auth"
            className="text-cream border-[0.5px] border-white/30 px-6 py-[12px] rounded-full text-[14px] font-medium cursor-pointer inline-flex items-center gap-2 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.97]"
          >
            Find Your Crows →
          </Link>
          <button className="bg-transparent text-gray-5 border-[0.5px] border-gray-3 px-6 py-[12px] rounded-full text-[14px] cursor-pointer transition-colors hover:text-cream hover:border-gray-5">
            See how it works
          </button>
        </div>
      </div>

      <div className="hero-right relative max-w-full h-[560px] hidden sm:block">

        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            // background:
            //    "radial-gradient(ellipse 70% 55% at 30% 38%, rgba(74,124,89,0.32) 0%, transparent 75%), radial-gradient(ellipse 65% 50% at 72% 48%, rgba(196,124,43,0.28) 0%, transparent 75%)",
          }}
        />

        <div
          className="profile-card card-1 absolute w-[265px] rounded-3xl overflow-hidden border-[0.5px] border-gray-3 bg-gray-2 top-[18px] left-[10px] z-[2]"
          style={{
            boxShadow:
              "0 18px 36px -16px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="h-[200px] flex items-center justify-center relative overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 30% 25%, #3a6048 0%, #244335 35%, #1a2a20 70%, #0d1612 100%)",
            }}
          >
            <div
              className="absolute font-syne text-[80px] font-extrabold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-[-4px] pointer-events-none"
              style={{ color: "rgba(106,171,122,0.08)" }}
            >
              CH
            </div>
            <div className="relative z-[1]">
              <CrowSvg accent="#6aab7a" width={140} height={120} />
            </div>
          </div>
          <div className="p-5">
            <div className="font-syne text-[17px] font-bold text-cream mb-[3px]">
              Anika Kapoor
            </div>
            <div className="text-xs text-gray-5 mb-4 tracking-[0.03em]">
              Product Designer · Mumbai
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px] text-xs text-gray-5">
                <div className="w-[7px] h-[7px] bg-sage-light rounded-full" />
                Active now
              </div>
              <button className="bg-cream text-ink border-0 px-[18px] py-[7px] rounded-full text-xs font-medium cursor-pointer">
                Follow
              </button>
            </div>
          </div>
        </div>

        <div
          className="profile-card card-2 absolute w-[265px] rounded-3xl overflow-hidden border-[0.5px] border-gray-3 bg-gray-2 top-[90px] right-[10px] z-[1]"
          style={{
            boxShadow:
              "0 18px 36px -16px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="h-[200px] flex items-center justify-center relative overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 30% 25%, #5e3c1c 0%, #3d2a14 35%, #261a0c 70%, #150e07 100%)",
            }}
          >
            <div
              className="absolute font-syne text-[80px] font-extrabold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-[-4px] pointer-events-none"
              style={{ color: "rgba(224,155,69,0.08)" }}
            >
              CH
            </div>
            <div className="relative z-[1]">
              <CrowSvg accent="#e09b45" width={140} height={120} />
            </div>
          </div>
          <div className="p-5">
            <div className="font-syne text-[17px] font-bold text-cream mb-[3px]">
              Rohan Shah
            </div>
            <div className="text-xs text-gray-5 mb-4 tracking-[0.03em]">
              Startup Founder · Delhi
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px] text-xs text-gray-5">
                <div className="w-[7px] h-[7px] bg-amber-light rounded-full" />
                Active now
              </div>
              <button className="bg-cream text-ink border-0 px-[18px] py-[7px] rounded-full text-xs font-medium cursor-pointer">
                Follow
              </button>
            </div>
          </div>
        </div>

        <div className="absolute w-[46px] h-[46px] rounded-full bg-gray-2 border-[0.5px] border-gray-3 flex items-center justify-center text-gray-5 z-[3] top-[120px] right-2">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888888"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="absolute w-[46px] h-[46px] rounded-full bg-gray-2 border-[0.5px] border-gray-3 flex items-center justify-center text-gray-5 z-[3] bottom-[140px] left-0">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888888"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
