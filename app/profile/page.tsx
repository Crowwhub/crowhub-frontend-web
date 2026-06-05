"use client";

import { useEffect, useMemo, useState } from "react";
import GlassSelect from "@/components/GlassSelect";
import Sidebar from "@/components/Sidebar";
import { ApiError, api } from "@/lib/api";

/* ============================================================ Types & data */

type ProfileType = "" | "student" | "professional" | "freelancer";
type Intent = "" | "networking" | "hiring" | "referral" | "mentorship";

type ProfileData = {
  name: string;
  avatar: string;
  role: string;
  location: string;
  type: ProfileType;
  company: string;
  education: string;
  experience: number;
  domain: string;
  intent: Intent;
  skills: string[];
  interests: string[];
  birthday: string;
  gender: string;
  currentlyWorkingOn: string;
  goals: string[];
  findMeFor: string[];
};

const DEFAULT_PROFILE: ProfileData = {
  name: "",
  avatar: "🐦‍⬛",
  role: "",
  location: "",
  type: "professional",
  company: "",
  education: "",
  experience: 1,
  domain: "",
  intent: "networking",
  skills: [],
  interests: [],
  birthday: "",
  gender: "",
  currentlyWorkingOn: "",
  goals: [],
  findMeFor: [],
};

const DOMAIN_FIND_TAGS: Record<string, { label: string; emoji: string }[]> = {
  "Software Developer": [
    { label: "Leetcode partner", emoji: "🧩" },
    { label: "Open source collab", emoji: "🌱" },
    { label: "Hackathon teammate", emoji: "⚡" },
    { label: "Code review buddy", emoji: "👀" },
    { label: "Tech interview prep", emoji: "💼" },
    { label: "System design study group", emoji: "🧠" },
  ],
  "Data Analyst": [
    { label: "Kaggle teammate", emoji: "📊" },
    { label: "ML study partner", emoji: "🤖" },
    { label: "SQL puzzles", emoji: "🧮" },
    { label: "Data viz critique", emoji: "📈" },
  ],
  Designer: [
    { label: "Design critique", emoji: "🎨" },
    { label: "Portfolio reviewer", emoji: "📁" },
    { label: "Branding collab", emoji: "✨" },
    { label: "Dribbble buddy", emoji: "🏀" },
  ],
  "Product Manager": [
    { label: "Strategy buddy", emoji: "🎯" },
    { label: "Product critique", emoji: "🔍" },
    { label: "PM study group", emoji: "📚" },
  ],
  Writer: [
    { label: "Writing partner", emoji: "✍️" },
    { label: "Editing buddy", emoji: "📝" },
    { label: "Newsletter collab", emoji: "📰" },
    { label: "Book club", emoji: "📖" },
  ],
  Photographer: [
    { label: "Shoot collaborator", emoji: "📷" },
    { label: "Editing critique", emoji: "🖼️" },
    { label: "Photo walk buddy", emoji: "🚶" },
  ],
  Singer: [
    { label: "Vocal duet", emoji: "🎤" },
    { label: "Songwriting partner", emoji: "🎵" },
    { label: "Open mic buddy", emoji: "🎙️" },
  ],
  Musician: [
    { label: "Band member", emoji: "🎸" },
    { label: "Jam buddy", emoji: "🎹" },
    { label: "Producer collab", emoji: "🎛️" },
  ],
  Artist: [
    { label: "Art collab", emoji: "🎨" },
    { label: "Studio buddy", emoji: "🖌️" },
    { label: "Exhibition partner", emoji: "🖼️" },
  ],
  Filmmaker: [
    { label: "Film collaborator", emoji: "🎬" },
    { label: "Script reader", emoji: "📜" },
    { label: "Festival circuit", emoji: "🎞️" },
  ],
  Entrepreneur: [
    { label: "Co-founder", emoji: "🚀" },
    { label: "Investor intro", emoji: "💰" },
    { label: "Founder accountability", emoji: "📌" },
  ],
};

const UNIVERSAL_FIND_TAGS: { label: string; emoji: string }[] = [
  { label: "Co-founder", emoji: "🚀" },
  { label: "Mentor", emoji: "🧭" },
  { label: "Mentee", emoji: "🌱" },
  { label: "Coffee chat", emoji: "☕" },
  { label: "Networking buddy", emoji: "🤝" },
  { label: "Side project partner", emoji: "🛠️" },
  { label: "Travel buddy", emoji: "✈️" },
  { label: "Gym partner", emoji: "🏋️" },
  { label: "Valorant partner", emoji: "🎮" },
  { label: "Matiks squad", emoji: "🔢" },
  { label: "Chess opponent", emoji: "♟️" },
  { label: "Reading group", emoji: "📖" },
  { label: "Just to chat", emoji: "💬" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const POPULAR_GOALS = [
  "Land a job at FAANG",
  "Compose original music",
  "Build a profitable side project",
  "Join a top design studio",
  "Travel and work remotely",
  "Publish a book",
  "Start my own company",
  "Learn machine learning",
  "Speak at a conference",
  "Become a full-time freelancer",
];

const AVATARS = [
  { id: "crow", emoji: "🐦‍⬛", bg: "linear-gradient(135deg,#1e2e22,#0f1a13)", ring: "#6aab7a" },
  { id: "owl", emoji: "🦉", bg: "linear-gradient(135deg,#2c1f0e,#1a1208)", ring: "#e09b45" },
  { id: "eagle", emoji: "🦅", bg: "linear-gradient(135deg,#1e2e22,#0f1a13)", ring: "#6aab7a" },
  { id: "penguin", emoji: "🐧", bg: "linear-gradient(135deg,#242424,#101010)", ring: "#aaaaaa" },
  { id: "duck", emoji: "🦆", bg: "linear-gradient(135deg,#2c1f0e,#1a1208)", ring: "#e09b45" },
  { id: "swan", emoji: "🦢", bg: "linear-gradient(135deg,#1e2e22,#0f1a13)", ring: "#6aab7a" },
  { id: "parrot", emoji: "🦜", bg: "linear-gradient(135deg,#2c1f0e,#1a1208)", ring: "#e09b45" },
];

const TYPE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Working Professional" },
  { value: "freelancer", label: "Freelancer" },
];

const DOMAIN_OPTIONS = [
  { value: "Software Developer", label: "Software Developer" },
  { value: "Data Analyst", label: "Data Analyst" },
  { value: "Designer", label: "Designer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Writer", label: "Writer" },
  { value: "Photographer", label: "Photographer" },
  { value: "Singer", label: "Singer" },
  { value: "Musician", label: "Musician" },
  { value: "Artist", label: "Artist" },
  { value: "Filmmaker", label: "Filmmaker" },
  { value: "Entrepreneur", label: "Entrepreneur" },
  { value: "Other", label: "Other" },
];

const INTENT_OPTIONS = [
  { value: "networking", label: "Networking" },
  { value: "hiring", label: "Hiring" },
  { value: "referral", label: "Referral" },
  { value: "mentorship", label: "Mentorship" },
];

const ALL_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "Swift", "Kotlin", "Ruby",
  "React", "Vue", "Next.js", "Svelte", "Tailwind CSS", "HTML/CSS",
  "Node.js", "Express", "Django", "FastAPI", "GraphQL", "REST APIs",
  "PostgreSQL", "MongoDB", "Redis", "MySQL",
  "AWS", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux",
  "Figma", "Sketch", "Photoshop", "Illustrator", "After Effects",
  "UI Design", "UX Research", "Prototyping", "Design Systems", "Branding", "Typography",
  "SQL", "Excel", "Tableau", "Power BI", "R", "Statistics", "Machine Learning",
  "Vocals", "Guitar", "Piano", "Drums", "Music Production", "Mixing", "Songwriting",
  "Drawing", "Painting", "Digital Art", "Animation", "3D Modeling", "Illustration",
  "Photography", "Portrait Photography", "Video Editing", "Lightroom", "DaVinci Resolve",
  "Copywriting", "Technical Writing", "Content Strategy", "SEO", "Editing", "Storytelling",
  "Marketing", "Sales", "Project Management", "Public Speaking", "Leadership",
];

const ALL_INTERESTS: { label: string; emoji: string }[] = [
  { label: "Frontend Development", emoji: "🎨" },
  { label: "Databases", emoji: "🗄️" },
  { label: "UI/UX Design", emoji: "✨" },
  { label: "AI & Machine Learning", emoji: "🤖" },
  { label: "Full-Stack Development", emoji: "🚀" },
  { label: "Product Strategy", emoji: "🎯" },
  { label: "Design System", emoji: "🧩" },
  { label: "Cloud & DevOps", emoji: "☁️" },
  { label: "Software Engineering", emoji: "⚙️" },
  { label: "APIs & Integrations", emoji: "🔌" },
  { label: "Product Thinking", emoji: "💡" },
  { label: "Backend Systems", emoji: "⚡" },
  { label: "Data & Analytics", emoji: "📊" },
  { label: "Exploring Opportunities", emoji: "🔭" },
  { label: "Networking", emoji: "🤝" },
  { label: "Collaboration", emoji: "🌐" },
  { label: "Mobile Development", emoji: "📱" },
  { label: "Open Source", emoji: "🌱" },
];

const TYPE_LABEL: Record<Exclude<ProfileType, "">, string> = {
  student: "Student",
  professional: "Professional",
  freelancer: "Freelancer",
};

/* ============================================================ Page */

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [skillQuery, setSkillQuery] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<ProfileData | null>(null);

  function addGoal(g: string) {
    const cleaned = g.trim();
    if (!cleaned || profile.goals.includes(cleaned)) return;
    update("goals", [...profile.goals, cleaned]);
  }
  function removeGoal(g: string) {
    update("goals", profile.goals.filter((x) => x !== g));
  }

  function toggleFindMeFor(label: string) {
    const has = profile.findMeFor.includes(label);
    update(
      "findMeFor",
      has
        ? profile.findMeFor.filter((x) => x !== label)
        : [...profile.findMeFor, label]
    );
  }

  const findTagsDomainSpecific = DOMAIN_FIND_TAGS[profile.domain] ?? [];
  const findTagsUniversal = UNIVERSAL_FIND_TAGS.filter(
    (t) => !findTagsDomainSpecific.some((d) => d.label === t.label)
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me.get();
        if (cancelled) return;
        setProfile((p) => ({
          ...p,
          name: me.name ?? p.name,
          avatar: me.avatar ?? p.avatar,
          role: me.role ?? p.role,
          location: me.location ?? p.location,
          type: (me.personType ?? p.type) as ProfileData["type"],
          company: me.company ?? p.company,
          education: me.education ?? p.education,
          experience: me.experience ?? p.experience,
          domain: me.domain ?? p.domain,
          intent: (me.findMeFor?.[0] ?? p.intent) as ProfileData["intent"],
          skills: me.skills ?? p.skills,
          interests: me.interests ?? p.interests,
          birthday: me.birthday ? me.birthday.split("T")[0] : p.birthday,
          gender: me.gender ?? p.gender,
          currentlyWorkingOn: me.currentlyWorkingOn ?? p.currentlyWorkingOn,
          goals: me.goals ?? p.goals,
          findMeFor: me.findMeFor ?? p.findMeFor,
        }));
      } catch {
        // Fall back to local cache (e.g. visitor not logged in yet)
        try {
          const raw = localStorage.getItem("crowhub:profile");
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<ProfileData>;
            if (!cancelled) setProfile((p) => ({ ...p, ...parsed }));
          } else {
            const name = localStorage.getItem("crowhub:name") ?? "";
            const avatar = localStorage.getItem("crowhub:avatar") ?? "🐦‍⬛";
            if (!cancelled) setProfile((p) => ({ ...p, name, avatar }));
          }
        } catch {}
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function startEdit() {
    setSnapshot(profile);
    setIsEditing(true);
    setSkillQuery("");
  }

  function cancelEdit() {
    if (snapshot) setProfile(snapshot);
    setSnapshot(null);
    setIsEditing(false);
    setSkillQuery("");
  }

  async function handleSave() {
    try {
      localStorage.setItem("crowhub:profile", JSON.stringify(profile));
      if (profile.name) localStorage.setItem("crowhub:name", profile.name);
      if (profile.avatar) localStorage.setItem("crowhub:avatar", profile.avatar);
    } catch {}
    try {
      await api.me.update({
        name: profile.name || undefined,
        avatar: profile.avatar || undefined,
        role: profile.role || undefined,
        location: profile.location || undefined,
        personType: profile.type
          ? (profile.type as "student" | "professional" | "freelancer")
          : undefined,
        company: profile.company || undefined,
        education: profile.education || undefined,
        experience: profile.experience,
        domain: profile.domain || undefined,
        skills: profile.skills,
        interests: profile.interests,
        birthday: profile.birthday || undefined,
        gender: profile.gender
          ? (profile.gender as "male" | "female" | "non-binary" | "prefer-not-to-say")
          : undefined,
        currentlyWorkingOn: profile.currentlyWorkingOn || undefined,
        goals: profile.goals,
        findMeFor: profile.findMeFor,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      alert(
        err instanceof ApiError
          ? err.message
          : "Couldn't save. Try again."
      );
      return;
    }
    setSnapshot(null);
    setIsEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  const skillSuggestions = useMemo(() => {
    const q = skillQuery.toLowerCase().trim();
    const pool = ALL_SKILLS.filter((s) => !profile.skills.includes(s));
    if (!q) return pool.slice(0, 18);
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 24);
  }, [skillQuery, profile.skills]);

  function addSkill(s: string) {
    if (!profile.skills.includes(s)) update("skills", [...profile.skills, s]);
    setSkillQuery("");
  }
  function removeSkill(s: string) {
    update("skills", profile.skills.filter((x) => x !== s));
  }
  function toggleInterest(label: string) {
    const has = profile.interests.includes(label);
    update("interests", has ? profile.interests.filter((i) => i !== label) : [...profile.interests, label]);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-[10%] right-[14%] w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.12] animate-blob-1"
          style={{
            background: "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[28%] w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.10] animate-blob-2"
          style={{
            background: "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="md:pl-[260px]">
        <div className="px-8 pt-12 pb-20 max-w-[760px]">
          <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-5 mb-1.5">
                Your profile
              </div>
              <h1 className="font-syne text-[36px] font-extrabold tracking-[-1.4px] text-cream leading-none">
                {isEditing ? "Edit your details" : "How others see you"}
              </h1>
              <p className="text-[13px] text-gray-5 mt-3 font-light max-w-[440px]">
                {isEditing
                  ? "Update what other crows see when they discover you."
                  : "This is what other crows see when they discover you."}
              </p>
            </div>
            {!isEditing && loaded && (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-2 text-cream border-[0.5px] border-white/30 px-5 py-2.5 rounded-full text-[13px] font-medium cursor-pointer bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_14px_rgba(0,0,0,0.3)] hover:from-white/30 hover:to-white/10 transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit profile
              </button>
            )}
          </div>

          {loaded && <ProfilePreview profile={profile} />}

          {isEditing && (
          <div className="mt-8 flex flex-col gap-6">
            <Section title="Avatar">
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => {
                  const isSelected = profile.avatar === a.emoji;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => update("avatar", a.emoji)}
                      aria-label={`Pick ${a.id}`}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[22px] border-[0.5px] transition-all hover:scale-105"
                      style={{
                        background: a.bg,
                        borderColor: isSelected ? a.ring : "rgba(255,255,255,0.1)",
                        boxShadow: isSelected
                          ? `0 0 0 2px ${a.ring}, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      {a.emoji}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Basics">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name">
                  <TextInput
                    value={profile.name}
                    onChange={(v) => update("name", v)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Role / Title">
                  <TextInput
                    value={profile.role}
                    onChange={(v) => update("role", v)}
                    placeholder="e.g. Product Designer"
                  />
                </Field>
                <Field label="Location">
                  <TextInput
                    value={profile.location}
                    onChange={(v) => update("location", v)}
                    placeholder="e.g. Mumbai"
                  />
                </Field>
                <Field label="Years of experience">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={profile.experience}
                      onChange={(e) =>
                        update("experience", Math.max(0, Number(e.target.value) || 0))
                      }
                      className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] pr-14 text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] text-gray-5 pointer-events-none">
                      years
                    </span>
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Personal">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Birthday">
                  <input
                    type="date"
                    value={profile.birthday}
                    onChange={(e) => update("birthday", e.target.value)}
                    className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30 [color-scheme:dark]"
                  />
                </Field>
                <Field label="Gender">
                  <GlassSelect
                    value={profile.gender}
                    onChange={(v) => update("gender", v)}
                    options={GENDER_OPTIONS}
                    placeholder="Pick what fits"
                  />
                </Field>
              </div>
            </Section>

            <Section title="⚡ Currently working on">
              <textarea
                value={profile.currentlyWorkingOn}
                onChange={(e) => update("currentlyWorkingOn", e.target.value)}
                placeholder="One sentence on what you're building or learning right now. Optional."
                rows={2}
                className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-2xl px-5 py-3 text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30 leading-snug font-light resize-y"
              />
            </Section>

            <Section title="🚀 Goals">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGoal(goalInput);
                        setGoalInput("");
                      }
                    }}
                    placeholder="Type a goal and hit enter. Optional."
                    className="flex-1 bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addGoal(goalInput);
                      setGoalInput("");
                    }}
                    disabled={!goalInput.trim()}
                    className="text-cream border-[0.5px] border-white/30 px-5 py-[11px] rounded-full text-[13px] font-medium cursor-pointer bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md hover:from-white/30 hover:to-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {profile.goals.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.goals.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => removeGoal(g)}
                        aria-label={`Remove ${g}`}
                        className="inline-flex items-center gap-1.5 text-cream border-[0.5px] border-white/25 px-3 py-1.5 rounded-full text-[12px] bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-white/25 hover:to-white/10 transition-all"
                      >
                        {g}
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
                    Popular goals
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_GOALS.filter((g) => !profile.goals.includes(g)).map(
                      (g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => addGoal(g)}
                          className="inline-flex items-center gap-1 text-gray-5 border-[0.5px] border-gray-3 px-3 py-1.5 rounded-full text-[12px] hover:text-cream hover:border-white/20 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-gray-4">+</span> {g}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Work">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="I am a">
                  <GlassSelect
                    value={profile.type}
                    onChange={(v) => update("type", v as ProfileType)}
                    options={TYPE_OPTIONS}
                    placeholder="Select"
                  />
                </Field>
                <Field label="Domain">
                  <GlassSelect
                    value={profile.domain}
                    onChange={(v) => update("domain", v)}
                    options={DOMAIN_OPTIONS}
                    placeholder="Pick a field"
                  />
                </Field>
                <Field label="Looking for">
                  <GlassSelect
                    value={profile.intent}
                    onChange={(v) => update("intent", v as Intent)}
                    options={INTENT_OPTIONS}
                    placeholder="Select"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Education & Company">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Education">
                  <TextInput
                    value={profile.education}
                    onChange={(v) => update("education", v)}
                    placeholder="e.g. B.Tech, IIT Bombay"
                  />
                </Field>
                <Field label="Company">
                  <TextInput
                    value={profile.company}
                    onChange={(v) => update("company", v)}
                    placeholder="e.g. Google"
                  />
                </Field>
              </div>
            </Section>

            <Section title="People can find you for">
              <div className="flex flex-col gap-4">
                {findTagsDomainSpecific.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5">
                      Based on your domain ·{" "}
                      <span className="text-cream">{profile.domain}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {findTagsDomainSpecific.map((t) => {
                        const on = profile.findMeFor.includes(t.label);
                        return (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => toggleFindMeFor(t.label)}
                            aria-pressed={on}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all cursor-pointer ${
                              on
                                ? "text-cream border-white/30 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                                : "text-gray-5 border-gray-3 bg-transparent hover:text-cream hover:border-white/20 hover:bg-white/5"
                            }`}
                          >
                            <span aria-hidden="true">{t.emoji}</span> {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5">
                    {findTagsDomainSpecific.length > 0
                      ? "Or these"
                      : "Pick what fits"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {findTagsUniversal.map((t) => {
                      const on = profile.findMeFor.includes(t.label);
                      return (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => toggleFindMeFor(t.label)}
                          aria-pressed={on}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all cursor-pointer ${
                            on
                              ? "text-cream border-white/30 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                              : "text-gray-5 border-gray-3 bg-transparent hover:text-cream hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <span aria-hidden="true">{t.emoji}</span> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Skills">
              <div className="flex flex-col gap-4">
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
                    value={skillQuery}
                    onChange={(e) => setSkillQuery(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full pl-12 pr-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
                  />
                </div>

                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => removeSkill(s)}
                        aria-label={`Remove ${s}`}
                        className="inline-flex items-center gap-1.5 text-cream border-[0.5px] border-white/25 px-3 py-1.5 rounded-full text-[12px] bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-white/25 hover:to-white/10 transition-all"
                      >
                        {s}
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
                    {skillQuery.trim() ? "Results" : "Suggestions"}
                  </div>
                  {skillSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {skillSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addSkill(s)}
                          className="inline-flex items-center gap-1 text-gray-5 border-[0.5px] border-gray-3 px-3 py-1.5 rounded-full text-[12px] hover:text-cream hover:border-white/20 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-gray-4">+</span> {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-gray-4 italic">
                      {skillQuery.trim()
                        ? `No skills match "${skillQuery}".`
                        : "Nothing left to add."}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Interests">
              <div className="flex flex-wrap gap-2">
                {ALL_INTERESTS.map((i) => {
                  const isSelected = profile.interests.includes(i.label);
                  return (
                    <button
                      key={i.label}
                      type="button"
                      onClick={() => toggleInterest(i.label)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] border-[0.5px] transition-all cursor-pointer ${
                        isSelected
                          ? "text-cream border-white/30 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-white/30 hover:to-white/10"
                          : "text-gray-5 border-gray-3 bg-transparent hover:text-cream hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <span aria-hidden="true">{i.emoji}</span>
                      {i.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSave}
                className="text-cream border-[0.5px] border-white/30 px-6 py-3 rounded-full text-[14px] font-medium cursor-pointer bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99]"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-5 border-[0.5px] border-gray-3 px-5 py-3 rounded-full text-[13px] cursor-pointer hover:text-cream hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          )}

          {!isEditing && saved && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 text-[12px] text-sage-light">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Profile saved
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ============================================================ Building blocks */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-gray-5">
        {title}
      </div>
      <div className="rounded-2xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md p-5">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-gray-5">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
    />
  );
}

function ProfilePreview({ profile }: { profile: ProfileData }) {
  const avatarMeta =
    AVATARS.find((a) => a.emoji === profile.avatar) ?? AVATARS[0];
  const accent = avatarMeta.ring;
  const accentSoft = `${accent}55`;
  const accentBorder = `${accent}99`;
  const typeLabel = profile.type ? TYPE_LABEL[profile.type] : "—";

  return (
    <div
      className="relative rounded-3xl p-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(26,26,26,0.92) 0%, rgba(36,36,36,0.85) 100%)",
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 0 0 1px ${accentBorder}, 0 0 50px ${accentSoft}, 0 22px 50px -16px rgba(0,0,0,0.6)`,
      }}
    >
      <div className="absolute top-3 right-4 text-[10px] uppercase tracking-[0.18em] text-gray-5">
        Preview
      </div>

      <div className="flex items-start gap-4 mb-5">
        <div
          className="flex-shrink-0 w-[68px] h-[68px] rounded-full flex items-center justify-center text-[34px] border-[1.5px]"
          style={{
            background: avatarMeta.bg,
            borderColor: accent,
            boxShadow: `0 0 0 3px ${accent}22, 0 0 24px ${accentSoft}`,
          }}
        >
          <span>{profile.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-syne text-[22px] font-bold text-cream tracking-[-0.6px] leading-tight mb-1">
            {profile.name || "Your name"}
          </h2>
          <div className="text-[13px] text-gray-5">
            {profile.role || "Add a role"}
            {profile.company ? ` · ${profile.company}` : ""}
          </div>
          {profile.education && (
            <div className="text-[12px] text-gray-5">🎓 {profile.education}</div>
          )}
          <div className="text-[12px] text-gray-5">
            {profile.location || "Add a location"} ·{" "}
            {profile.experience} yr{profile.experience === 1 ? "" : "s"}
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border-[0.5px] flex-shrink-0 mt-1"
          style={{ borderColor: `${accent}66`, color: accent }}
        >
          {typeLabel}
        </span>
      </div>

      {profile.currentlyWorkingOn && (
        <div
          className="mb-4 px-4 py-3 rounded-xl border-[0.5px] flex items-start gap-2"
          style={{
            borderColor: `${accent}44`,
            background: `linear-gradient(180deg, ${accent}10, transparent)`,
          }}
        >
          <span className="text-[14px]">⚡</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-0.5">
              Currently working on
            </div>
            <p className="text-[12.5px] text-cream leading-[1.45] font-light">
              {profile.currentlyWorkingOn}
            </p>
          </div>
        </div>
      )}

      {profile.goals.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            🚀 Goals
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.goals.slice(0, 4).map((g) => (
              <span
                key={g}
                className="text-[11px] px-2.5 py-1 rounded-full border-[0.5px]"
                style={{
                  color: accent,
                  borderColor: `${accent}66`,
                  background: `${accent}12`,
                }}
              >
                {g}
              </span>
            ))}
            {profile.goals.length > 4 && (
              <span className="text-[11px] text-gray-5 px-1 py-1">
                +{profile.goals.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {profile.findMeFor.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            People can find you for
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.findMeFor.slice(0, 5).map((t) => (
              <span
                key={t}
                className="text-[11px] text-cream border-[0.5px] border-white/15 bg-white/[0.06] px-2.5 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
            {profile.findMeFor.length > 5 && (
              <span className="text-[11px] text-gray-5 px-1 py-1">
                +{profile.findMeFor.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {profile.skills.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 6).map((s) => (
              <span
                key={s}
                className="text-[11px] text-cream border-[0.5px] border-white/15 bg-white/[0.06] px-2.5 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
            {profile.skills.length > 6 && (
              <span className="text-[11px] text-gray-5 px-1 py-1">
                +{profile.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {profile.interests.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            Interests
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 5).map((i) => (
              <span
                key={i}
                className="text-[11px] text-gray-5 border-[0.5px] border-gray-3 px-2.5 py-1 rounded-full"
              >
                {i}
              </span>
            ))}
            {profile.interests.length > 5 && (
              <span className="text-[11px] text-gray-5 px-1 py-1">
                +{profile.interests.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#222]">
        <span
          className="text-[11px] uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          ↗ {profile.intent || "—"}
        </span>
        <span className="text-[11px] text-gray-5">
          {profile.domain || "Add a domain"}
        </span>
      </div>
    </div>
  );
}
