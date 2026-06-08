"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GlassSelect from "@/components/GlassSelect";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

const roles = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Working Professional" },
  { value: "freelancer", label: "Freelancer" },
  { value: "founder", label: "Founder" },
  { value: "recruiter", label: "Recruiter" },
  { value: "investor", label: "Investor" },
  { value: "explorer", label: "Explorer" },
  { value: "aspirant", label: "Aspirant" },
  { value: "educator", label: "Educator" },
  { value: "other", label: "Other" },
];

// Common exams/goals an Aspirant might be preparing for (free-text allowed too).
const ASPIRANT_OPTIONS = [
  "UPSC",
  "GATE",
  "NEET PG",
  "NEET UG",
  "JEE",
  "CAT",
  "GRE",
  "GMAT",
  "CA",
  "CFA",
  "UGC NET",
  "SSC",
  "Banking",
  "CLAT",
].map((s) => ({ value: s, label: s }));

const domains = [
  { value: "software-developer", label: "Software Developer" },
  { value: "frontend-developer", label: "Frontend Developer" },
  { value: "backend-developer", label: "Backend Developer" },
  { value: "fullstack-developer", label: "Full-Stack Developer" },
  { value: "ios-developer", label: "iOS Developer" },
  { value: "android-developer", label: "Android Developer" },
  { value: "mobile-developer", label: "Mobile Developer" },
  { value: "devops-engineer", label: "DevOps Engineer" },
  { value: "ml-engineer", label: "ML Engineer" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "game-developer", label: "Game Developer" },
  { value: "security-engineer", label: "Security Engineer" },
  { value: "qa-engineer", label: "QA Engineer" },
  { value: "blockchain-developer", label: "Blockchain Developer" },
  { value: "designer", label: "Designer" },
  { value: "product-manager", label: "Product Manager" },
  { value: "writer", label: "Writer" },
  { value: "photographer", label: "Photographer" },
  { value: "singer", label: "Singer" },
  { value: "musician", label: "Musician" },
  { value: "artist", label: "Artist" },
  { value: "filmmaker", label: "Filmmaker" },
  { value: "marketing", label: "Marketing Professional" },
  { value: "educator", label: "Educator" },
  { value: "researcher", label: "Researcher" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "lawyer", label: "Lawyer" },
  { value: "doctor", label: "Doctor" },
  { value: "architect", label: "Architect" },
  { value: "electronics-engineer", label: "Electronics Engineer" },
  { value: "embedded-engineer", label: "Embedded Systems Engineer" },
  { value: "robotics-engineer", label: "Robotics Engineer" },
  { value: "hardware-engineer", label: "Hardware Engineer" },
  { value: "iot-engineer", label: "IoT Engineer" },
  { value: "electrical-engineer", label: "Electrical Engineer" },
  { value: "mechatronics-engineer", label: "Mechatronics Engineer" },
  { value: "vlsi-engineer", label: "VLSI Engineer" },
  { value: "firmware-engineer", label: "Firmware Engineer" },
];

export default function RolePage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [aspirantOf, setAspirantOf] = useState("");
  const [profYears, setProfYears] = useState("");
  const [practiceYears, setPracticeYears] = useState("");

  // Final personType sent to the backend: free-text value if "Other", else the preset.
  const effectiveRole =
    role === "other" ? customRole.trim() : role;

  return (
    <div className="w-full max-w-[480px] relative">
      <div className="flex items-center justify-between mb-6">
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
        <OnboardingProgress current={3} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[30px] font-extrabold tracking-[-1.3px] leading-[1.1] mb-3 text-cream inline-block">
          What do you do?
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Tell us about your work so we can connect you with the right people.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const raw = localStorage.getItem("crowhub:profile");
              const existing = raw ? JSON.parse(raw) : {};
              const merged = {
                ...existing,
                type: effectiveRole,
                domain,
                company: role === "professional" ? company.trim() : "",
                aspirantOf: role === "aspirant" ? aspirantOf.trim() : "",
                experience: Number(profYears) || 0,
                practiceYears: Number(practiceYears) || 0,
              };
              localStorage.setItem("crowhub:profile", JSON.stringify(merged));
            } catch {}
            try {
              await api.me.update({
                personType: effectiveRole,
                domain,
                ...(role === "professional" && company.trim()
                  ? { company: company.trim() }
                  : {}),
                ...(role === "aspirant" && aspirantOf.trim()
                  ? { aspirantOf: aspirantOf.trim() }
                  : {}),
                experience: Number(profYears) || 0,
                practiceYears: Number(practiceYears) || 0,
              });
              router.push("/auth/onboarding/skills");
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
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="role"
              className="text-[11px] uppercase tracking-[0.12em] text-gray-5"
            >
              I am a
            </label>
            <GlassSelect
              id="role"
              value={role}
              onChange={(v) => {
                setRole(v);
                if (v !== "other") setCustomRole("");
              }}
              options={roles}
              placeholder="Select role"
              searchable
              searchPlaceholder="Search roles…"
            />
            {role === "other" && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Indie hacker, Career-break, Researcher"
                maxLength={60}
                className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="domain"
              className="text-[11px] uppercase tracking-[0.12em] text-gray-5"
            >
              Domain
            </label>
            <GlassSelect
              id="domain"
              value={domain}
              onChange={setDomain}
              options={domains}
              placeholder="Select domain"
              searchable
              searchPlaceholder="Search domains…"
              allowCustom
            />
          </div>

          {role === "professional" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="company"
                className="text-[11px] uppercase tracking-[0.12em] text-gray-5"
              >
                Company{" "}
                <span className="text-gray-4 normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Acme Inc."
                maxLength={80}
                className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
              />
            </div>
          )}

          {role === "aspirant" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="aspirantOf"
                className="text-[11px] uppercase tracking-[0.12em] text-gray-5"
              >
                Aspirant of
              </label>
              <GlassSelect
                id="aspirantOf"
                value={aspirantOf}
                onChange={setAspirantOf}
                options={ASPIRANT_OPTIONS}
                placeholder="e.g. UPSC, GATE, NEET PG"
                searchable
                searchPlaceholder="Search or type an exam…"
                allowCustom
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
                Professional exp.
              </span>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={profYears}
                  onChange={(e) => setProfYears(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] pr-14 text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] text-gray-5 pointer-events-none">
                  years
                </span>
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-5">
                Practicing exp.
              </span>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={practiceYears}
                  onChange={(e) => setPracticeYears(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[13px] pr-14 text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] text-gray-5 pointer-events-none">
                  years
                </span>
              </div>
            </label>
          </div>

          <p className="text-[11px] text-gray-5 leading-[1.5] -mt-2 px-1 font-light">
            Practicing includes the time you've spent learning, not just paid work.
          </p>

          <button
            type="submit"
            disabled={!effectiveRole || !domain}
            className="mt-3 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-white/25 disabled:hover:to-white/10 disabled:hover:scale-100"
          >
            Next →
          </button>
        </form>
      </div>
    </div>
  );
}
