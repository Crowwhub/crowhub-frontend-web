import Link from "next/link";

export default function Nav() {
  return (
    <div className="sticky top-4 z-50 mt-6 mb-10 px-4 flex justify-center">
      <nav className="w-full max-w-[700px] flex items-center justify-between gap-6 px-5 py-2.5 rounded-2xl border-[0.5px] border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <Link
          href="/"
          className="font-syne font-extrabold text-[18px] tracking-[-0.5px] text-cream"
        >
          Crow<span className="text-gray-5">Hub</span>
        </Link>
        <ul className="flex gap-6 list-none">
          {["Discover", "Connect", "Pricing", "Blog"].map((item) => (
            <li key={item}>
              <a
                href="#"
                className="text-gray-5 text-[13px] transition-colors hover:text-cream"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/auth/signup"
          className="text-cream border-[0.5px] border-white/25 px-[18px] py-2 rounded-full text-[13px] font-medium cursor-pointer bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-150 hover:from-white/30 hover:to-white/10 hover:scale-[0.97]"
        >
          Join now →
        </Link>
      </nav>
    </div>
  );
}
