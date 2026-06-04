import Link from "next/link";

export default function AuthChoicePage() {
  return (
    <div className="w-full max-w-[420px]">
    <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="inline-flex items-center gap-2 bg-gray-2/60 border-[0.5px] border-white/10 backdrop-blur-md rounded-full px-[14px] py-[6px] text-xs text-gray-5 tracking-[0.08em] uppercase mb-6">
        <div className="w-[6px] h-[6px] bg-gray-5 rounded-full animate-pulse-dot" />
        Welcome
      </div>
      <h1 className="font-syne text-[36px] font-extrabold tracking-[-1.5px] leading-[1.05] mb-3 text-cream">
        Join the
        <br />
        <em className="not-italic text-gray-5">flock</em>
      </h1>
      <p className="text-[15px] text-gray-5 leading-[1.6] mb-8 font-light">
        Connect with real people. Discover communities that matter to you.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/auth/signup"
          className="text-cream text-center border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99]"
        >
          Create account
        </Link>
        <Link
          href="/auth/login"
          className="text-gray-5 text-center border-[0.5px] border-gray-3 px-5 py-[14px] rounded-full text-[15px] transition-colors hover:text-cream hover:border-gray-5"
        >
          Log in
        </Link>
      </div>
    </div>
    </div>
  );
}
