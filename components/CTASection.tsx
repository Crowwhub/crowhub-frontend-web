export default function CTASection() {
  return (
    <div className="relative p-[1px] rounded-3xl overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-[-50%] animate-conic-spin"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.22), rgba(255,255,255,0.04), rgba(255,255,255,0.18), rgba(255,255,255,0.04), rgba(255,255,255,0.22), rgba(255,255,255,0.04))",
        }}
      />
      <div className="relative bg-gray-1 rounded-3xl px-6 sm:px-12 py-16 sm:py-20 text-center">
        <h2 className="font-syne text-[34px] sm:text-[44px] md:text-[56px] font-extrabold tracking-[-2px] leading-[1.04] mb-4">
          Ready to join
          <br />
          the flock?
        </h2>
        <p className="text-[15px] text-gray-5 mb-8">
          Be among the first. No spam, no noise — just the right people.
        </p>
        <form className="flex flex-col sm:flex-row gap-2 max-w-[440px] mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-ink border-[0.5px] border-gray-3 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-gray-5"
          />
          <button
            type="submit"
            className="bg-cream text-ink border-0 px-6 py-[14px] rounded-full text-[14px] font-medium cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-150 hover:scale-[0.97] whitespace-nowrap"
          >
            Get early access
          </button>
        </form>
      </div>
    </div>
  );
}
