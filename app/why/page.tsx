"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

/* ============================================================ Motion helpers */

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function Reveal({
  children,
  className,
  y = 30,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative min-h-screen w-full flex flex-col items-center justify-center px-6 py-24 ${className}`}
    >
      {children}
    </section>
  );
}

/* ============================================================ Decorative bits */

function GlowBlob({
  className,
  color,
}: {
  className?: string;
  color: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
      style={{ background: `radial-gradient(circle, ${color}, transparent 65%)` }}
    />
  );
}

function FloatingBird({
  className,
  size = 56,
  delay = 0,
  duration = 6,
}: {
  className?: string;
  size?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.img
      src="/crowhub_logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`pointer-events-none select-none rounded-full ${className ?? ""}`}
      style={{ filter: "drop-shadow(0 0 26px rgba(106,171,122,0.4))" }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.92, scale: 1, y: [0, -14, 0] }}
      transition={{
        opacity: { duration: 1.1, ease: EASE },
        scale: { duration: 1.1, ease: EASE },
        y: { duration, repeat: Infinity, ease: "easeInOut", delay },
      }}
    />
  );
}

// Deterministic positions to avoid SSR hydration mismatch.
const PARTICLES = [
  { l: "8%", t: "22%", d: 6 },
  { l: "18%", t: "70%", d: 8 },
  { l: "30%", t: "35%", d: 7 },
  { l: "44%", t: "80%", d: 9 },
  { l: "57%", t: "18%", d: 6.5 },
  { l: "68%", t: "62%", d: 8.5 },
  { l: "78%", t: "30%", d: 7.5 },
  { l: "88%", t: "72%", d: 6 },
  { l: "92%", t: "44%", d: 9 },
  { l: "12%", t: "48%", d: 7 },
  { l: "50%", t: "55%", d: 8 },
  { l: "73%", t: "12%", d: 6.8 },
];

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/50"
          style={{ left: p.l, top: p.t, width: 3, height: 3 }}
          animate={{ y: [0, -22, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{
            duration: p.d,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.25,
          }}
        />
      ))}
    </div>
  );
}

function LetterReveal({ text, className }: { text: string; className?: string }) {
  return (
    <motion.h1
      className={className}
      aria-label={text}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } } }}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          style={{ whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: "0.45em" },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
          }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.h1>
  );
}

const H2 =
  "font-syne font-extrabold tracking-[-1.5px] text-cream leading-[1.08] text-[clamp(30px,5vw,52px)]";
const DESC =
  "text-gray-5 font-light leading-[1.65] text-[15px] sm:text-[17px]";

/* ============================================================ Page */

export default function WhyCrowHubPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink text-cream">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 backdrop-blur-md bg-ink/40 border-b border-white/[0.06]">
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
          href="/auth/signup"
          className="text-cream border-[0.5px] border-white/25 px-4 py-1.5 rounded-full text-[13px] font-medium bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md transition-all hover:from-white/30 hover:to-white/10"
        >
          Join now
        </Link>
      </div>

      <Hero />
      <RightPeople />
      <IntentCards />
      <MatchIntent />
      <KnowWhy />
      <LessRandom />
      <FinalCTA />
    </div>
  );
}

/* ============================================================ Section 1 — Hero */

function Hero() {
  return (
    <Section className="text-center overflow-hidden">
      <Particles />
      <GlowBlob
        className="top-[6%] right-[8%] w-[420px] h-[420px] opacity-[0.16]"
        color="rgba(106,171,122,0.5)"
      />
      <GlowBlob
        className="bottom-[8%] left-[6%] w-[420px] h-[420px] opacity-[0.13]"
        color="rgba(224,155,69,0.45)"
      />
      <FloatingBird className="absolute top-[16%] right-[14%]" size={54} />
      <FloatingBird
        className="absolute bottom-[20%] left-[12%] hidden sm:block"
        size={38}
        delay={1.4}
        duration={7}
      />

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="text-[11px] uppercase tracking-[0.24em] text-gray-5 mb-6"
      >
        The CrowHub story
      </motion.span>

      <LetterReveal
        text="Why CrowHub?"
        className="font-syne font-extrabold tracking-[-2px] text-cream text-[clamp(44px,9vw,88px)]"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
        className="max-w-[560px] text-gray-5 text-[16px] sm:text-[18px] leading-[1.6] mt-7 font-light"
      >
        Most opportunities come from people. Finding the right people
        shouldn’t depend on luck.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-5"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-[18px] h-[28px] rounded-full border border-white/20 flex items-start justify-center p-1"
        >
          <span className="w-[3px] h-[6px] rounded-full bg-gray-5" />
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ============================================================ Section 2 */

function RightPeople() {
  return (
    <Section>
      <Reveal className="text-center">
        <h2 className={H2}>
          People are everywhere.
          <br />
          <span className="text-[#555]">The right people aren’t.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="text-center mt-5 max-w-[600px]">
        <p className={DESC}>
          Most platforms help you find profiles. CrowHub helps you discover
          people who actually align with your goals, interests, and intent.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-14 w-full max-w-[900px]">
        {/* Left: endless scrolling profiles */}
        <Reveal>
          <div className="relative rounded-3xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md p-5 h-[300px] overflow-hidden">
            <div className="text-[10px] uppercase tracking-[0.16em] text-gray-5 mb-3">
              Other platforms
            </div>
            <div className="relative h-[230px] overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_18%,#000_82%,transparent)]">
              <motion.div
                animate={{ y: ["0%", "-50%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="flex flex-col gap-2.5"
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <FauxRow key={i} dim />
                ))}
              </motion.div>
            </div>
          </div>
        </Reveal>

        {/* Right: intentional discovery */}
        <Reveal delay={0.12}>
          <div
            className="relative rounded-3xl border-[0.5px] p-5 h-[300px] flex flex-col"
            style={{
              borderColor: "rgba(106,171,122,0.45)",
              background:
                "linear-gradient(180deg, rgba(106,171,122,0.08), rgba(26,26,26,0.5))",
              boxShadow: "0 0 50px rgba(106,171,122,0.18)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.16em] text-sage-light mb-3">
              CrowHub
            </div>
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
                className="w-full rounded-2xl border-[0.5px] border-white/15 bg-gray-1/60 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-11 h-11 rounded-full bg-gray-1 border-[0.5px] border-sage-light/50 flex items-center justify-center text-[22px]">
                    🦅
                  </span>
                  <div>
                    <div className="font-syne text-[15px] font-bold text-cream">
                      Aanya R.
                    </div>
                    <div className="text-[12px] text-gray-5">
                      Founder · building in AI
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Chip>Same intent: Build</Chip>
                  <Chip>Shared goal: Startup</Chip>
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function FauxRow({ dim }: { dim?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-[0.5px] border-white/[0.06] bg-white/[0.02] px-3 py-2.5 ${
        dim ? "opacity-45" : ""
      }`}
    >
      <span className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <span className="h-2 w-2/3 rounded-full bg-white/[0.08]" />
        <span className="h-2 w-1/3 rounded-full bg-white/[0.05]" />
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] text-sage-light border-[0.5px] border-sage-light/40 bg-sage-light/[0.08] px-2.5 py-1 rounded-full">
      {children}
    </span>
  );
}

/* ============================================================ Section 3 */

const INTENTS = [
  { e: "🧠", t: "Learn" },
  { e: "🚀", t: "Build" },
  { e: "🤝", t: "Collaborate" },
  { e: "🎮", t: "Gaming" },
  { e: "📚", t: "Study" },
  { e: "💼", t: "Networking" },
  { e: "🎯", t: "Mentorship" },
  { e: "🌱", t: "Growth" },
];

function IntentCards() {
  return (
    <Section>
      <GlowBlob
        className="top-[20%] left-[50%] -translate-x-1/2 w-[520px] h-[300px] opacity-[0.10]"
        color="rgba(122,158,192,0.5)"
      />
      <Reveal className="text-center">
        <h2 className={H2}>Tell CrowHub what you’re looking for.</h2>
      </Reveal>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-12 w-full max-w-[760px]"
      >
        {INTENTS.map((c) => (
          <motion.div
            key={c.t}
            variants={item}
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative rounded-2xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md p-5 flex flex-col items-center gap-2.5 cursor-default overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(106,171,122,0.18), transparent 70%)",
              }}
            />
            <span className="text-[30px] relative">{c.e}</span>
            <span className="font-syne text-[14px] font-bold text-cream relative">
              {c.t}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <Reveal delay={0.1} className="text-center mt-10 max-w-[440px]">
        <p className={DESC}>Your intent becomes the starting point.</p>
      </Reveal>
    </Section>
  );
}

/* ============================================================ Section 4 */

const MATCH_NODES = [
  { e: "🦉", x: "8%", y: "12%", label: "Learn" },
  { e: "🦜", x: "70%", y: "6%", label: "Build" },
  { e: "🦢", x: "4%", y: "66%", label: "Collaborate" },
  { e: "🐧", x: "72%", y: "68%", label: "Network" },
];

function MatchIntent() {
  return (
    <Section>
      <Reveal className="text-center">
        <h2 className={H2}>CrowHub finds people who match your intent.</h2>
      </Reveal>
      <Reveal delay={0.1} className="text-center mt-5 max-w-[600px]">
        <p className={DESC}>
          Looking for someone to learn with? Building a startup? Need
          collaborators? Want to meet like-minded people? CrowHub helps you
          discover relevant people instead of leaving connections to algorithms.
        </p>
      </Reveal>

      <div className="relative mt-14 w-full max-w-[620px] aspect-[1.4/1]">
        {/* Connection lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[
            [16, 22],
            [78, 14],
            [12, 74],
            [80, 76],
          ].map(([x, y], i) => (
            <motion.line
              key={i}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="rgba(106,171,122,0.45)"
              strokeWidth="0.4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.15 }}
            />
          ))}
        </svg>

        {/* Center "you" */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-[26px] border-[1.5px] border-sage-light z-10"
          style={{
            background: "rgba(10,10,10,0.7)",
            boxShadow: "0 0 30px rgba(106,171,122,0.5)",
          }}
        >
          🐦‍⬛
        </motion.div>

        {/* Surrounding profile cards */}
        {MATCH_NODES.map((n, i) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.5 + i * 0.15 }}
            className="absolute flex items-center gap-2 rounded-2xl border-[0.5px] border-white/12 bg-gray-1/70 backdrop-blur-md px-3 py-2"
            style={{ left: n.x, top: n.y }}
          >
            <span className="text-[20px]">{n.e}</span>
            <span className="text-[12px] text-cream font-medium">{n.label}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================ Section 5 */

const BADGES = ["Networking", "Mentorship", "Collaborate", "Hiring", "Learn", "Build"];

function KnowWhy() {
  return (
    <Section>
      <GlowBlob
        className="top-[30%] left-[50%] -translate-x-1/2 w-[480px] h-[280px] opacity-[0.12]"
        color="rgba(224,155,69,0.4)"
      />
      <Reveal className="text-center">
        <h2 className={H2}>Know why you’re connecting.</h2>
      </Reveal>
      <Reveal delay={0.1} className="text-center mt-6 max-w-[520px]">
        <p className={DESC}>
          Every profile carries context. Not just{" "}
          <span className="text-gray-4 italic">“Who is this person?”</span> but{" "}
          <span className="text-cream font-medium">
            “Why do they want to connect?”
          </span>
        </p>
      </Reveal>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-12 max-w-[600px]"
      >
        {BADGES.map((b) => (
          <motion.span
            key={b}
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              show: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.55, ease: EASE },
              },
            }}
            whileHover={{ scale: 1.08 }}
            className="text-[13px] sm:text-[15px] text-cream rounded-full px-4 py-2 border-[0.5px] border-sage-light/40"
            style={{
              background: "rgba(106,171,122,0.1)",
              boxShadow: "0 0 22px rgba(106,171,122,0.22)",
            }}
          >
            ↗ {b}
          </motion.span>
        ))}
      </motion.div>
    </Section>
  );
}

/* ============================================================ Section 6 */

const GRAPH_NODES = [
  { cx: 50, cy: 50, r: 6, center: true },
  { cx: 20, cy: 26, r: 4 },
  { cx: 80, cy: 22, r: 4 },
  { cx: 16, cy: 72, r: 4 },
  { cx: 84, cy: 70, r: 4 },
  { cx: 50, cy: 14, r: 3.5 },
  { cx: 50, cy: 86, r: 3.5 },
];

function LessRandom() {
  return (
    <Section>
      <Reveal className="text-center">
        <h2 className={H2}>
          Less randomness.
          <br />
          <span className="text-[#555]">More meaningful connections.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="text-center mt-5 max-w-[560px]">
        <p className={DESC}>
          No endless scrolling. No hoping the algorithm gets it right. Just
          discovering people who share your goals, interests, and journey.
        </p>
      </Reveal>

      <div className="relative mt-12 w-full max-w-[520px] aspect-square">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {GRAPH_NODES.slice(1).map((n, i) => (
            <motion.line
              key={`l${i}`}
              x1="50"
              y1="50"
              x2={n.cx}
              y2={n.cy}
              stroke="rgba(122,158,192,0.4)"
              strokeWidth="0.35"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.4 + i * 0.12 }}
            />
          ))}
          {GRAPH_NODES.map((n, i) => (
            <motion.circle
              key={`c${i}`}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={n.center ? "#6aab7a" : "#7a9ec0"}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 16,
                delay: 0.2 + i * 0.1,
              }}
              style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
            />
          ))}
        </svg>
      </div>
    </Section>
  );
}

/* ============================================================ Final CTA */

function FinalCTA() {
  return (
    <Section className="text-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] max-w-[120vw] rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(106,171,122,0.45), rgba(224,155,69,0.18), transparent 70%)",
        }}
      />
      <FloatingBird className="absolute top-[18%] left-[16%] hidden sm:block" size={46} />
      <FloatingBird
        className="absolute bottom-[22%] right-[14%]"
        size={56}
        delay={1}
        duration={6.5}
      />

      <Reveal>
        <h2 className="font-syne font-extrabold tracking-[-1.5px] text-cream leading-[1.1] text-[clamp(30px,5.5vw,56px)] max-w-[760px]">
          Your next opportunity is probably a person you haven’t met yet.
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="mt-6">
        <p className="text-gray-5 text-[16px] sm:text-[18px] font-light">
          Find your people today.
        </p>
      </Reveal>
      <Reveal delay={0.2} className="mt-10">
        <motion.div
          animate={{ boxShadow: [
            "0 0 30px rgba(106,171,122,0.35)",
            "0 0 55px rgba(106,171,122,0.6)",
            "0 0 30px rgba(106,171,122,0.35)",
          ] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-full inline-block"
        >
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-ink font-semibold text-[16px] px-9 py-4 rounded-full bg-gradient-to-b from-cream to-[#dcdcd2] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-transform hover:scale-[0.97]"
          >
            Join CrowHub →
          </Link>
        </motion.div>
      </Reveal>
    </Section>
  );
}
