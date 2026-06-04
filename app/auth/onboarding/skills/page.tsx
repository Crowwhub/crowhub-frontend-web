"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import OnboardingProgress from "@/components/OnboardingProgress";
import { ApiError, api } from "@/lib/api";

const ALL_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "Swift",
  "Kotlin",
  "Ruby",
  "PHP",
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Svelte",
  "Tailwind CSS",
  "HTML/CSS",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "Ruby on Rails",
  "GraphQL",
  "REST APIs",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "MySQL",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Linux",
  "Figma",
  "Sketch",
  "Photoshop",
  "Illustrator",
  "After Effects",
  "Premiere Pro",
  "UI Design",
  "UX Research",
  "Prototyping",
  "Design Systems",
  "Branding",
  "Typography",
  "SQL",
  "Excel",
  "Tableau",
  "Power BI",
  "R",
  "Statistics",
  "Machine Learning",
  "Deep Learning",
  "Data Visualization",
  "Vocals",
  "Guitar",
  "Piano",
  "Drums",
  "Bass",
  "Music Production",
  "Mixing",
  "Mastering",
  "Songwriting",
  "Music Theory",
  "Drawing",
  "Painting",
  "Digital Art",
  "Animation",
  "3D Modeling",
  "Illustration",
  "Sculpting",
  "Photography",
  "Portrait Photography",
  "Landscape Photography",
  "Video Editing",
  "Lightroom",
  "DaVinci Resolve",
  "Color Grading",
  "Copywriting",
  "Technical Writing",
  "Content Strategy",
  "SEO",
  "Editing",
  "Storytelling",
  "Marketing",
  "Sales",
  "Project Management",
  "Public Speaking",
  "Leadership",
  "Strategy",
  "Operations",
];

export default function SkillsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const pool = ALL_SKILLS.filter((s) => !selected.includes(s));
    if (!q) return pool.slice(0, 18);
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 24);
  }, [query, selected]);

  function add(skill: string) {
    setSelected((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
    setQuery("");
  }

  function remove(skill: string) {
    setSelected((prev) => prev.filter((s) => s !== skill));
  }

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
        <OnboardingProgress current={4} total={8} />
      </div>

      <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/70 to-gray-2/40 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h1 className="font-syne text-[30px] font-extrabold tracking-[-1.3px] leading-[1.1] mb-3 text-cream inline-block">
          What can you do?
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-white/40 to-transparent mb-4" />
        <p className="text-[14px] text-gray-5 leading-[1.6] mb-8 font-light">
          Add your skills so people can find you and your work.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const raw = localStorage.getItem("crowhub:profile");
              const existing = raw ? JSON.parse(raw) : {};
              const merged = { ...existing, skills: selected };
              localStorage.setItem("crowhub:profile", JSON.stringify(merged));
            } catch {}
            try {
              await api.me.update({ skills: selected });
              router.push("/auth/onboarding/find-me-for");
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
          <div className="relative">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-5 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full pl-12 pr-5 py-[13px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
            />
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => remove(s)}
                  className="inline-flex items-center gap-2 text-cream border-[0.5px] border-white/30 px-3 py-1.5 rounded-full text-[12px] bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:from-white/30 hover:to-white/10"
                  aria-label={`Remove ${s}`}
                >
                  {s}
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-gray-5 mb-3">
              {query.trim() ? "Results" : "Popular"}
            </div>
            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => add(s)}
                    className="inline-flex items-center gap-1.5 text-gray-5 border-[0.5px] border-gray-3 px-3 py-1.5 rounded-full text-[12px] cursor-pointer transition-colors hover:text-cream hover:border-white/30 hover:bg-white/5"
                  >
                    <span className="text-gray-4">+</span>
                    {s}
                  </button>
                ))}
              </div>
            ) : query.trim() && !selected.includes(query.trim()) ? (
              <button
                type="button"
                onClick={() => add(query.trim())}
                className="inline-flex items-center gap-1.5 text-cream border-[0.5px] border-white/30 px-3.5 py-1.5 rounded-full text-[12px] cursor-pointer bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-150 hover:from-white/30 hover:to-white/10"
              >
                <span className="text-gray-4">+</span>
                Add &ldquo;{query.trim()}&rdquo;
              </button>
            ) : (
              <p className="text-[12px] text-gray-4 italic">
                Start typing to add a skill.
              </p>
            )}
          </div>

          <div className="text-[11px] text-gray-5 font-light">
            {selected.length} skill{selected.length === 1 ? "" : "s"} selected
          </div>

          <button
            type="submit"
            disabled={selected.length === 0}
            className="mt-2 text-cream border-[0.5px] border-white/30 px-5 py-[14px] rounded-full text-[15px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Next →
          </button>
        </form>
      </div>
    </div>
  );
}
