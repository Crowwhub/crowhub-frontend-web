import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-[14%] right-[16%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.13] animate-blob-1"
          style={{
            background:
              "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[14%] left-[20%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.10] animate-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-syne font-extrabold text-[17px] tracking-[-0.5px] text-cream"
        >
          <img
            src="/crowhub_logo.png"
            alt="CrowHub"
            width={26}
            height={26}
            className="rounded-full"
          />
          Crow<span className="text-gray-5">Hub</span>
        </Link>
        <Link
          href="/why"
          className="text-gray-5 text-[13px] transition-colors hover:text-cream"
        >
          Why CrowHub
        </Link>
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-[52px] mb-5 inline-block animate-icon-glow">🐦‍⬛</div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gray-5 mb-2">
          About Us
        </div>
        <h1 className="font-syne text-[clamp(30px,6vw,48px)] font-extrabold tracking-[-1px] text-cream leading-tight mb-3">
          Coming soon
        </h1>
        <p className="text-[14px] sm:text-[15px] text-gray-5 leading-[1.6] font-light max-w-[440px]">
          We&apos;re putting our story together — who we are, why we built
          CrowHub, and where we&apos;re headed. Check back soon. 🚧
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-cream border-[0.5px] border-white/25 px-5 py-2.5 rounded-full text-[13px] font-medium bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md transition-all hover:from-white/30 hover:to-white/10"
        >
          ← Back home
        </Link>
      </main>
    </div>
  );
}
