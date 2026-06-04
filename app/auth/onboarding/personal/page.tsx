"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GlassSelect from "@/components/GlassSelect";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

type BirthdayCheck = {
  near: boolean;
  isToday: boolean;
  daysAway: number;
};

function checkBirthday(value: string): BirthdayCheck {
  if (!value) return { near: false, isToday: false, daysAway: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsed = new Date(value);
  if (isNaN(parsed.getTime()))
    return { near: false, isToday: false, daysAway: 0 };
  const thisYear = new Date(
    today.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
  thisYear.setHours(0, 0, 0, 0);
  const diffMs = thisYear.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return {
    near: Math.abs(diffDays) <= 30,
    isToday: diffDays === 0,
    daysAway: diffDays,
  };
}

function buildBirthdayMessage(check: BirthdayCheck, name: string) {
  if (check.isToday) {
    return {
      title: `Hey ${name}, it's your birthday!`,
      sub: "Happy birthday from your future flock 🎂. We can't wait to see what you'll do this year.",
      emoji: "🎂",
    };
  }
  if (check.daysAway > 0) {
    return {
      title: `${name}, your birthday is incoming!`,
      sub: `Only ${check.daysAway} day${check.daysAway === 1 ? "" : "s"} away — we're already excited 🎉`,
      emoji: "🎈",
    };
  }
  const back = Math.abs(check.daysAway);
  return {
    title: `Hope your birthday was lovely, ${name}!`,
    sub: `It was ${back} day${back === 1 ? "" : "s"} ago — better late than never from the flock 🎉`,
    emoji: "🎉",
  };
}

export default function PersonalPage() {
  const router = useRouter();
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("buddy");
  const [popup, setPopup] = useState<
    | { title: string; sub: string; emoji: string }
    | null
  >(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crowhub:name");
      if (saved) setName(saved.split(" ")[0] || saved);
      const raw = localStorage.getItem("crowhub:profile");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.birthday) setBirthday(p.birthday);
        if (p.gender) setGender(p.gender);
        if (p.location) setLocation(p.location);
      }
    } catch {}
  }, []);

  function persist() {
    try {
      const raw = localStorage.getItem("crowhub:profile");
      const existing = raw ? JSON.parse(raw) : {};
      const merged = { ...existing, birthday, gender, location };
      localStorage.setItem("crowhub:profile", JSON.stringify(merged));
    } catch {}
  }

  async function proceed() {
    persist();
    try {
      await api.me.update({
        birthday,
        gender: gender as "male" | "female" | "non-binary" | "prefer-not-to-say",
        location: location.trim(),
      });
      router.push("/auth/onboarding/role");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login");
        return;
      }
      alert(
        err instanceof ApiError
          ? err.message
          : "Couldn't save. Try again."
      );
    }
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const check = checkBirthday(birthday);
    if (check.near) {
      setPopup(buildBirthdayMessage(check, name));
    } else {
      proceed();
    }
  }

  return (
    <div className="w-full max-w-[480px] relative">
      <div className="flex items-center justify-between mb-6">
        <BackButton router={router} />
        <OnboardingProgress current={2} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[28px] font-extrabold tracking-[-1.2px] leading-[1.1] mb-3 text-cream inline-block">
          A little about you ✨
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          So people can find their kind of flock — and so we can wish you on the right day.
        </p>

        <form onSubmit={handleNext} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
              Birthday
            </span>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
              className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[12px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30 [color-scheme:dark]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
              Gender
            </span>
            <GlassSelect
              value={gender}
              onChange={setGender}
              options={GENDERS}
              placeholder="Pick what fits"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
              Location
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Mumbai, India"
              className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
            />
          </label>

          <button
            type="submit"
            disabled={!birthday || !gender || !location.trim()}
            className="mt-3 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Next →
          </button>
        </form>
      </div>

      {popup && (
        <BirthdayPopup
          {...popup}
          onClose={() => {
            setPopup(null);
            proceed();
          }}
        />
      )}
    </div>
  );
}

function BackButton({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-2 text-gray-5 text-sm transition-colors hover:text-cream"
      aria-label="Go back"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Back
    </button>
  );
}

function BirthdayPopup({
  title,
  sub,
  emoji,
  onClose,
}: {
  title: string;
  sub: string;
  emoji: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-ink/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-3xl border-[0.5px] border-white/20 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl p-10 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(106,171,122,0.28), 0 0 120px rgba(224,155,69,0.18)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(106,171,122,0.22) 0%, rgba(224,155,69,0.12) 50%, transparent 80%)",
          }}
        />
        <div className="relative">
          <div className="text-[72px] mb-5 inline-block animate-icon-glow">
            {emoji}
          </div>
          <h2 className="font-syne text-[26px] font-extrabold text-cream mb-3 tracking-[-0.6px] leading-tight animate-text-glow">
            {title}
          </h2>
          <p className="text-[14px] text-gray-5 leading-[1.6] mb-7 font-light max-w-[320px] mx-auto">
            {sub}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-cream border-[0.5px] border-white/30 px-6 py-3 rounded-full text-[14px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] hover:from-white/35 hover:to-white/15 transition-all"
          >
            Awesome, let's go →
          </button>
        </div>
      </div>
    </div>
  );
}
