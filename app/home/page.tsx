"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "driver.js/dist/driver.css";
import GlassSelect from "@/components/GlassSelect";
import Sidebar from "@/components/Sidebar";
import TopMatchesRow, {
  type TopMatchProfile,
  type TopMatchIntent,
} from "@/components/TopMatchesRow";
import {
  api,
  ApiError,
  type CrowResult,
  type Intent,
  type ConfigMatch,
  type ShowcaseItem,
} from "@/lib/api";
import { useProfileLikes } from "@/lib/useProfileLikes";
import { INTENT_LABELS } from "@/lib/intentLabel";
import ShowcaseList from "@/components/ShowcaseList";

type ProfileType = "student" | "professional" | "freelancer";

type Profile = {
  id: string;
  name: string;
  emoji: string;
  accent: "sage" | "amber";
  role: string;
  location: string;
  type: ProfileType;
  experience: number;
  domain: string;
  intent: string;
  skills: string[];
  interests: string[];
  goals?: string[];
  findMeFor?: string[];
  currentlyWorkingOn?: string;
  showcase?: ShowcaseItem[];
};

function toProfile(c: CrowResult): Profile {
  const fallbackType: ProfileType = "professional";
  const personType = (c.personType ?? fallbackType) as ProfileType;
  const validType: ProfileType =
    personType === "student" ||
    personType === "professional" ||
    personType === "freelancer"
      ? personType
      : fallbackType;
  // Stable accent per id so re-fetches don't flicker.
  const accent: Profile["accent"] =
    c.id.charCodeAt(0) % 2 === 0 ? "sage" : "amber";
  return {
    id: c.id,
    name: c.name ?? c.username,
    emoji: c.avatar ?? "🐦‍⬛",
    accent,
    role: c.role ?? "",
    location: c.location ?? "",
    type: validType,
    experience: c.experience ?? 0,
    domain: c.domain ?? "",
    intent: c.intent,
    skills: c.skills ?? [],
    interests: c.interests ?? [],
    goals: c.goals ?? [],
    findMeFor: c.findMeFor ?? [],
    currentlyWorkingOn: c.currentlyWorkingOn ?? undefined,
    showcase: c.showcase ?? [],
  };
}

const ACCENT: Record<Profile["accent"], { color: string; soft: string; border: string }> = {
  sage: {
    color: "#6aab7a",
    soft: "rgba(106,171,122,0.55)",
    border: "rgba(106,171,122,0.45)",
  },
  amber: {
    color: "#e09b45",
    soft: "rgba(224,155,69,0.5)",
    border: "rgba(224,155,69,0.45)",
  },
};

const PROFILES: Profile[] = [
  {
    id: "p1",
    name: "Anika Kapoor",
    emoji: "🐦‍⬛",
    accent: "sage",
    role: "Product Designer",
    location: "Mumbai",
    type: "professional",
    experience: 5,
    domain: "Designer",
    intent: "networking",
    skills: ["Figma", "UI Design", "Prototyping", "Design Systems"],
    interests: ["UI/UX Design", "Design System", "Product Strategy"],
    goals: ["Join a top design studio", "Speak at a conference"],
    findMeFor: ["Design critique", "Portfolio reviewer", "Coffee chat"],
    currentlyWorkingOn:
      "Redesigning the checkout flow for a payments product — focused on trust signals and micro-copy.",
  },
  {
    id: "p2",
    name: "Rohan Shah",
    emoji: "🦅",
    accent: "amber",
    role: "Startup Founder",
    location: "Delhi",
    type: "professional",
    experience: 8,
    domain: "Entrepreneur",
    intent: "hiring",
    skills: ["Strategy", "Leadership", "Product", "Operations"],
    interests: ["Networking", "Product Strategy", "Exploring Opportunities"],
    goals: ["Start my own company", "Make my first $100k"],
    findMeFor: ["Co-founder", "Investor intro", "Founder accountability"],
    currentlyWorkingOn:
      "Closing a seed round and hiring my first three engineers.",
  },
  {
    id: "p3",
    name: "Priya Joshi",
    emoji: "🦉",
    accent: "sage",
    role: "UI Designer",
    location: "Bangalore",
    type: "freelancer",
    experience: 3,
    domain: "Designer",
    intent: "mentorship",
    skills: ["Figma", "Branding", "Typography", "UI Design"],
    interests: ["Design System", "UI/UX Design"],
  },
  {
    id: "p4",
    name: "Arjun Verma",
    emoji: "🐧",
    accent: "amber",
    role: "CS Undergrad",
    location: "Pune",
    type: "student",
    experience: 1,
    domain: "Software Developer",
    intent: "referral",
    skills: ["TypeScript", "React", "Rust", "C++"],
    interests: ["Frontend Development", "Full-Stack Development", "Software Engineering"],
    goals: ["Land a job at FAANG", "Learn machine learning"],
    findMeFor: ["Leetcode partner", "Hackathon teammate", "Tech interview prep"],
    currentlyWorkingOn:
      "Building a Rust-based CLI for managing dotfiles and prepping for SWE internships.",
  },
  {
    id: "p5",
    name: "Sara Mehra",
    emoji: "🦢",
    accent: "sage",
    role: "Writer",
    location: "Mumbai",
    type: "freelancer",
    experience: 4,
    domain: "Writer",
    intent: "networking",
    skills: ["Copywriting", "Editing", "Storytelling", "Content Strategy"],
    interests: ["Networking", "Collaboration"],
    goals: ["Become a full-time freelancer", "Travel and work remotely"],
    findMeFor: ["Writing partner", "Editing buddy", "Book club"],
    currentlyWorkingOn:
      "A long-form essay on indie design studios in India — chasing 5 interviews this month.",
  },
  {
    id: "p6",
    name: "Neil Khanna",
    emoji: "🦜",
    accent: "amber",
    role: "Documentary Photographer",
    location: "Goa",
    type: "freelancer",
    experience: 7,
    domain: "Photographer",
    intent: "networking",
    skills: ["Photography", "Portrait", "Lightroom", "Editing"],
    interests: ["Collaboration", "Exploring Opportunities"],
  },
  {
    id: "p7",
    name: "Kavya Iyer",
    emoji: "🦆",
    accent: "sage",
    role: "Data Scientist",
    location: "Hyderabad",
    type: "professional",
    experience: 6,
    domain: "Data Analyst",
    intent: "hiring",
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    interests: ["AI & Machine Learning", "Data & Analytics", "Networking"],
  },
  {
    id: "p8",
    name: "Aditya Mehta",
    emoji: "🐦",
    accent: "amber",
    role: "Software Engineer",
    location: "Bangalore",
    type: "professional",
    experience: 4,
    domain: "Software Developer",
    intent: "networking",
    skills: ["Go", "PostgreSQL", "Docker", "Kubernetes"],
    interests: ["Backend Systems", "Cloud & DevOps", "Open Source"],
  },
  {
    id: "p9",
    name: "Diya Krishnan",
    emoji: "🦢",
    accent: "sage",
    role: "Singer-Songwriter",
    location: "Chennai",
    type: "freelancer",
    experience: 6,
    domain: "Musician",
    intent: "networking",
    skills: ["Vocals", "Songwriting", "Music Production", "Piano"],
    interests: ["Collaboration", "Networking"],
  },
  {
    id: "p10",
    name: "Karan Malhotra",
    emoji: "🦅",
    accent: "amber",
    role: "Filmmaker",
    location: "Mumbai",
    type: "freelancer",
    experience: 9,
    domain: "Filmmaker",
    intent: "networking",
    skills: ["Video Editing", "DaVinci Resolve", "Storytelling", "Color Grading"],
    interests: ["Collaboration", "Exploring Opportunities"],
  },
  {
    id: "p11",
    name: "Tara Singh",
    emoji: "🦉",
    accent: "sage",
    role: "CTO @ Lensit",
    location: "Bangalore",
    type: "professional",
    experience: 10,
    domain: "Software Developer",
    intent: "hiring",
    skills: ["Python", "Machine Learning", "AWS", "Leadership"],
    interests: ["AI & Machine Learning", "Backend Systems", "Networking"],
    goals: ["Speak at a conference", "Learn machine learning"],
    findMeFor: ["Code review buddy", "System design study group", "Hackathon teammate"],
    currentlyWorkingOn:
      "Scaling our retrieval pipeline to handle 10× more docs — and writing it up as a blog post.",
  },
  {
    id: "p12",
    name: "Vikram Rao",
    emoji: "🦜",
    accent: "amber",
    role: "Creative Director",
    location: "Delhi",
    type: "professional",
    experience: 12,
    domain: "Designer",
    intent: "hiring",
    skills: ["Branding", "Typography", "Design Systems", "Illustration"],
    interests: ["Branding", "UI/UX Design", "Collaboration"],
    goals: ["Join a top design studio", "Publish a book"],
  },
  {
    id: "p13",
    name: "Maya Bhatt",
    emoji: "🐦‍⬛",
    accent: "sage",
    role: "Visual Designer",
    location: "Bangalore",
    type: "freelancer",
    experience: 3,
    domain: "Designer",
    intent: "referral",
    skills: ["Figma", "Branding", "Illustration", "UI Design"],
    interests: ["Branding", "Design System", "UI/UX Design"],
  },
  {
    id: "p14",
    name: "Nikhil Reddy",
    emoji: "🦆",
    accent: "amber",
    role: "Data Analyst Intern",
    location: "Hyderabad",
    type: "student",
    experience: 1,
    domain: "Data Analyst",
    intent: "referral",
    skills: ["SQL", "Python", "Tableau", "Statistics"],
    interests: ["Data & Analytics", "AI & Machine Learning", "Exploring Opportunities"],
  },
  {
    id: "p15",
    name: "Sanjay Iyer",
    emoji: "🦅",
    accent: "sage",
    role: "Staff Engineer",
    location: "Bangalore",
    type: "professional",
    experience: 12,
    domain: "Software Developer",
    intent: "mentorship",
    skills: ["Distributed Systems", "Java", "Leadership", "Architecture"],
    interests: ["Software Engineering", "Backend Systems", "Networking"],
  },
  {
    id: "p16",
    name: "Riya Patel",
    emoji: "🦢",
    accent: "amber",
    role: "Senior Writer @ Wired",
    location: "Mumbai",
    type: "professional",
    experience: 8,
    domain: "Writer",
    intent: "mentorship",
    skills: ["Long-form Writing", "Editing", "Reporting", "Pitching"],
    interests: ["Networking", "Collaboration"],
  },
  {
    id: "p17",
    name: "Aman Sharma",
    emoji: "🦜",
    accent: "sage",
    role: "Documentary Photographer",
    location: "Jaipur",
    type: "freelancer",
    experience: 5,
    domain: "Photographer",
    intent: "mentorship",
    skills: ["Photography", "Portrait Photography", "Lightroom", "Storytelling"],
    interests: ["Collaboration", "Exploring Opportunities"],
  },
];

// Mirrors the unified findMeFor list (UNIVERSAL_TAGS + per-domain tags from
// app/auth/onboarding/find-me-for/page.tsx). Intent matches against
// User.findMeFor on the backend, so the VALUES here must equal those exactly.
const INTENTS = [
  // Universal — folded-in former purpose values
  "Networking",
  "Project Collab",
  "Hire me",
  "Referral",
  // Universal — original findMeFor
  "Co-founder",
  "Mentor",
  "Mentee",
  "Coffee chat",
  "Networking buddy",
  "Side project partner",
  "Travel buddy",
  "Gym partner",
  "Valorant partner",
  "Matiks squad",
  "Chess opponent",
  "Reading group",
  "Career guidance",
  "Just to chat",
  // Software Developer
  "Leetcode partner",
  "Open source collab",
  "Hackathon teammate",
  "Code review buddy",
  "Tech interview prep",
  "System design study group",
  // Data Analyst
  "Kaggle teammate",
  "ML study partner",
  "SQL puzzles",
  "Data viz critique",
  "Stats discussion",
  // Designer
  "Design critique",
  "Portfolio reviewer",
  "Branding collab",
  "Dribbble buddy",
  "Daily UI partner",
  // Product Manager
  "Strategy buddy",
  "Product critique",
  "PM study group",
  "Discovery interviews",
  // Writer
  "Writing partner",
  "Editing buddy",
  "Newsletter collab",
  "Pitch swap",
  "Book club",
  // Photographer
  "Shoot collaborator",
  "Editing critique",
  "Photo walk buddy",
  "Travel shoot",
  // Singer / Musician
  "Vocal duet",
  "Songwriting partner",
  "Open mic buddy",
  "Cover collab",
  "Band member",
  "Jam buddy",
  "Producer collab",
  "Co-writer",
  // Artist
  "Art collab",
  "Studio buddy",
  "Exhibition partner",
  "Sketch group",
  // Filmmaker
  "Film collaborator",
  "Script reader",
  "Festival circuit",
  "DoP / editor pair",
  // Entrepreneur
  "Investor intro",
  "Customer interview swap",
  "Founder accountability",
  // Marketing
  "Growth experiments",
  "Ad copy critique",
  "Campaign brainstorm",
  "SEO swap",
  // Educator
  "Teaching collab",
  "Curriculum buddy",
  "Workshop co-host",
  // Researcher
  "Research buddy",
  "Paper review",
  "Conference co-author",
].map((s) => ({ value: s, label: INTENT_LABELS[s] ?? s }));

const DOMAINS = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "iOS Developer",
  "Android Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "ML Engineer",
  "Data Scientist",
  "Data Analyst",
  "Game Developer",
  "Security Engineer",
  "QA Engineer",
  "Blockchain Developer",
  "Designer",
  "Product Manager",
  "Writer",
  "Photographer",
  "Singer",
  "Musician",
  "Artist",
  "Filmmaker",
  "Marketing Professional",
  "Educator",
  "Researcher",
  "Lawyer",
  "Doctor",
  "Architect",
  "Electronics Engineer",
  "Embedded Systems Engineer",
  "Robotics Engineer",
  "Hardware Engineer",
  "IoT Engineer",
  "Electrical Engineer",
  "Mechatronics Engineer",
  "VLSI Engineer",
  "Firmware Engineer",
  "Entrepreneur",
].map((s) => ({ value: s, label: s }));

const USER_TYPES = [
  { value: "", label: "Anyone" },
  { value: "student", label: "Student" },
  { value: "professional", label: "Working Professional" },
  { value: "freelancer", label: "Freelancer" },
  { value: "founder", label: "Founder" },
  { value: "recruiter", label: "Recruiter" },
  { value: "investor", label: "Investor" },
  { value: "explorer", label: "Explorer" },
  { value: "aspirant", label: "Aspirant" },
  { value: "educator", label: "Educator" },
];

const INTEREST_OPTIONS = [
  { value: "Frontend Development", label: "Frontend Development" },
  { value: "Databases", label: "Databases" },
  { value: "UI/UX Design", label: "UI/UX Design" },
  { value: "AI & Machine Learning", label: "AI & Machine Learning" },
  { value: "Full-Stack Development", label: "Full-Stack Development" },
  { value: "Product Strategy", label: "Product Strategy" },
  { value: "Design System", label: "Design System" },
  { value: "Cloud & DevOps", label: "Cloud & DevOps" },
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "APIs & Integrations", label: "APIs & Integrations" },
  { value: "Product Thinking", label: "Product Thinking" },
  { value: "Backend Systems", label: "Backend Systems" },
  { value: "Data & Analytics", label: "Data & Analytics" },
  { value: "Exploring Opportunities", label: "Exploring Opportunities" },
  { value: "Networking", label: "Networking" },
  { value: "Collaboration", label: "Collaboration" },
  { value: "Mobile Development", label: "Mobile Development" },
  { value: "Open Source", label: "Open Source" },
  { value: "Sports", label: "Sports" },
  { value: "Anime", label: "Anime" },
  { value: "Gaming", label: "Gaming" },
  { value: "Standup Comedy", label: "Standup Comedy" },
  { value: "Music", label: "Music" },
  { value: "Movies & TV", label: "Movies & TV" },
  { value: "Travel", label: "Travel" },
  { value: "Fitness", label: "Fitness" },
  { value: "Reading", label: "Reading" },
  { value: "Food", label: "Food" },
  { value: "Photography", label: "Photography" },
  { value: "Startups", label: "Startups" },
  { value: "Robotics", label: "Robotics" },
];

const GOAL_OPTIONS = [
  { value: "Land a job at FAANG", label: "Land a job at FAANG" },
  { value: "Land a job at Mangos", label: "Land a job at Mangos" },
  { value: "Compose original music", label: "Compose original music" },
  { value: "Build a profitable side project", label: "Build a profitable side project" },
  { value: "Join a top design studio", label: "Join a top design studio" },
  { value: "Travel and work remotely", label: "Travel and work remotely" },
  { value: "Publish a book", label: "Publish a book" },
  { value: "Start my own company", label: "Start my own company" },
  { value: "Learn machine learning", label: "Learn machine learning" },
  { value: "Speak at a conference", label: "Speak at a conference" },
  { value: "Become a full-time freelancer", label: "Become a full-time freelancer" },
];

const SKILL_OPTIONS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Swift",
  "Kotlin",
  "React",
  "Next.js",
  "Vue",
  "Svelte",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "GraphQL",
  "REST APIs",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Figma",
  "Photoshop",
  "Illustrator",
  "UI Design",
  "UX Research",
  "Prototyping",
  "Design Systems",
  "Branding",
  "Typography",
  "SQL",
  "Tableau",
  "Statistics",
  "Machine Learning",
  "Deep Learning",
  "Vocals",
  "Guitar",
  "Piano",
  "Music Production",
  "Songwriting",
  "Mixing",
  "Photography",
  "Portrait Photography",
  "Video Editing",
  "Lightroom",
  "DaVinci Resolve",
  "Copywriting",
  "Technical Writing",
  "Editing",
  "Storytelling",
  "Marketing",
  "Sales",
  "Project Management",
  "Leadership",
  "Strategy",
].map((s) => ({ value: s, label: s }));

const TYPE_LABEL: Record<ProfileType, string> = {
  student: "Student",
  professional: "Professional",
  freelancer: "Freelancer",

};

const TOP_MATCH_INTENTS: TopMatchIntent[] = [
  "networking",
  "hiring",
  "referral",
  "mentorship",
];

// Map a real match (from /config) to the TopMatchesRow shape.
function configMatchToTop(m: ConfigMatch): TopMatchProfile {
  const lc = (m.intent ?? "").toLowerCase();
  const intent = (TOP_MATCH_INTENTS as string[]).includes(lc)
    ? (lc as TopMatchIntent)
    : "networking";
  return {
    id: m.user.id,
    name: m.user.name ?? m.user.username,
    emoji: m.user.avatar ?? "🐦‍⬛",
    role: m.user.role ?? "",
    company: m.user.location ?? "",
    intent,
    online: false,
    mutuals: 0,
  };
}

export default function HomePage() {
  const [name, setName] = useState("there");
  const [intent, setIntent] = useState("");
  const [domain, setDomain] = useState("");
  const [userType, setUserType] = useState("");
  const [location, setLocation] = useState("");
  const [interest, setInterest] = useState("");
  const [goal, setGoal] = useState("");
  const [skill, setSkill] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [searchStarted, setSearchStarted] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [topMatches, setTopMatches] = useState<TopMatchProfile[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [streak, setStreak] = useState<{ count: number; active: boolean } | null>(
    null,
  );
  const [missingProfile, setMissingProfile] = useState<string[]>([]);
  const dragStartRef = useRef<number | null>(null);
  const dragCapturedRef = useRef(false);
  const DRAG_THRESHOLD = 6;

  // Persisted likes for the currently-visible profile only. As the user swipes,
  // the hook re-hydrates from the backend for the next profile.
  const visibleProfileId = results[currentIdx]?.id;
  const profileLikes = useProfileLikes(visibleProfileId);
  const isLiked = (profileId: string, key: string) =>
    profileId === visibleProfileId ? profileLikes.isLiked(key) : false;
  const toggleLike = (profileId: string, key: string) => {
    if (profileId !== visibleProfileId) return;
    void profileLikes.toggle(key);
  };

  const sounds = useSwipeSounds();
  const [avatar, setAvatar] = useState("🐦‍⬛");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crowhub:name");
      if (saved) setName(saved.split(" ")[0] || saved);
      const savedAvatar = localStorage.getItem("crowhub:avatar");
      if (savedAvatar) setAvatar(savedAvatar);
    } catch {}
  }, []);

  // Detect an incomplete profile (no company / education / showcase) to nudge
  // the user to fill it in for better discovery.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me.get();
        if (cancelled) return;
        const missing: string[] = [];
        if (!me.company) missing.push("company");
        if (!me.college) missing.push("education");
        if (!me.showcase || me.showcase.length === 0) missing.push("showcase");
        setMissingProfile(missing);
      } catch {
        // Unauthenticated or backend down — skip the nudge.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Real top matches + swipe streak from the backend config endpoint.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await api.config.get();
        if (cancelled) return;
        setTopMatches(config.matches.top.map(configMatchToTop));
        setMatchCount(config.matches.count);
        setStreak(config.streak);
      } catch {
        // Unauthenticated or backend down — leave the section empty.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Guided product tour for new users (driver.js). Anchored to the matches
  // row, intent/domain selects, advanced filters, and the find button.
  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    driver({
      showProgress: true,
      popoverClass: "crow-tour",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Got it 🎉",
      steps: [
        {
          element: '[data-tour="matches"]',
          popover: {
            title: "Your matches",
            description:
              "People you and someone both said yes to show up here. Tap a circle to peek at their profile or jump into chat.",
          },
        },
        {
          element: '[data-tour="intent"]',
          popover: {
            title: "Pick your intent",
            description:
              "Tell CrowHub why you're here — networking, project collaboration, hiring, mentorship and more.",
          },
        },
        {
          element: '[data-tour="domain"]',
          popover: {
            title: "Choose a domain",
            description:
              "The field you want to connect in — e.g. Software Developer, Designer, Doctor, Lawyer.",
          },
        },
        {
          element: '[data-tour="advanced"]',
          popover: {
            title: "Fine-tune it",
            description:
              "Open Advanced filters to narrow by location, skills, goals and person type.",
          },
        },
        {
          element: '[data-tour="find"]',
          popover: {
            title: "Find & swipe",
            description:
              "Hit Find crows, then swipe right to connect and left to pass. That's it — enjoy! 🐦‍⬛",
          },
        },
      ],
    }).drive();
  }, []);

  // Auto-run the tour once for first-time visitors.
  useEffect(() => {
    let cancelled = false;
    try {
      if (localStorage.getItem("crowhub:home-tour-v1")) return;
    } catch {}
    const t = window.setTimeout(() => {
      if (cancelled) return;
      void startTour();
      try {
        localStorage.setItem("crowhub:home-tour-v1", "1");
      } catch {}
    }, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [startTour]);

  const ready = !!intent && !!domain;
  const showEmpty = !ready;

  useEffect(() => {
    if (!ready) {
      setSearchStarted(false);
      setResults([]);
      setSearchError(null);
    }
  }, [ready]);

  useEffect(() => {
    setCurrentIdx(0);
    setDragX(0);
    setExitDir(null);
  }, [intent, domain, userType, location, interest, goal, skill]);

  async function runSearch() {
    if (!ready) return;
    setLoading(true);
    setSearchError(null);
    setSearchStarted(true);
    setCurrentIdx(0);
    try {
      const data = await api.swipes.feed({
        intent: intent as Intent,
        domain,
        personType: userType || undefined,
        location: location || undefined,
        interest: interest || undefined,
        goal: goal || undefined,
        skill: skill || undefined,
      });
      setResults(data.map(toProfile));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong searching for crows.";
      setSearchError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const current = results[currentIdx];
  const [matchedWith, setMatchedWith] = useState<Profile | null>(null);

  function commitSwipe(dir: "left" | "right") {
    const target = results[currentIdx];
    setExitDir(dir);
    sounds.play(dir === "right" ? "accept" : "decline");
    if (target) {
      const activeFilters: Record<string, string> = {};
      if (userType) activeFilters.personType = userType;
      if (location) activeFilters.location = location;
      if (interest) activeFilters.interest = interest;
      if (goal) activeFilters.goal = goal;
      if (skill) activeFilters.skill = skill;
      api.swipes
        .create({
          swipedId: target.id,
          direction: dir === "right" ? "RIGHT" : "LEFT",
          intent: intent || undefined,
          domain: domain || undefined,
          filters:
            Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
        })
        .then((res) => {
          if (res.ismatch && dir === "right") {
            setMatchedWith(target);
          }
        })
        .catch(() => {
          // Silent: swipe API failures shouldn't break the UI flow.
        });
    }
    window.setTimeout(() => {
      setCurrentIdx((i) => i + 1);
      setExitDir(null);
      setDragX(0);
    }, 520);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (exitDir) return;
    dragStartRef.current = e.clientX;
    dragCapturedRef.current = false;
    // Don't capture yet — wait until the user actually drags past a
    // threshold. Otherwise pointer capture intercepts the eventual
    // click event and the chips / buttons inside the card never fire.
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current === null) return;
    const dx = e.clientX - dragStartRef.current;
    if (!dragCapturedRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
      dragCapturedRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    if (dragCapturedRef.current) {
      setDragX(dx);
    }
  }
  function onPointerUp() {
    if (dragStartRef.current === null) return;
    const dx = dragX;
    dragStartRef.current = null;
    dragCapturedRef.current = false;
    if (Math.abs(dx) > 100) {
      commitSwipe(dx > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-linear-flow opacity-[0.55]"
          style={{
            background:
              "linear-gradient(125deg, rgba(106,171,122,0.10) 0%, rgba(10,10,10,0) 32%, rgba(122,158,192,0.08) 58%, rgba(10,10,10,0) 78%, rgba(224,155,69,0.10) 100%)",
          }}
        />
        <div
          className="absolute top-[10%] left-[20%] w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.14] animate-blob-1"
          style={{
            background: "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.12] animate-blob-2"
          style={{
            background: "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="md:pl-[260px]">
        <div className="px-8 pt-12 pb-20">
          <div className="relative z-20 max-w-[960px]">
            <div className="mb-8 text-left">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-5 mb-1.5">
                Welcome to CrowHub
              </div>
              <h1 className="font-syne text-[36px] font-extrabold tracking-[-1.4px] text-cream leading-none">
                Hey {name} <span className="inline-block">👋</span>
              </h1>
              {streak && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-white/15 bg-white/[0.05] backdrop-blur-md px-3 py-1.5 text-[12px]">
                  <span aria-hidden="true">🔥</span>
                  {streak.count > 0 ? (
                    <span className="text-cream font-medium">
                      {streak.count} day streak
                      {!streak.active && (
                        <span className="text-gray-5 font-normal">
                          {" "}· swipe today to keep it
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-5">
                      Swipe today to start a streak
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => void startTour()}
                className="mt-3 ml-2 inline-flex items-center gap-1 text-[12px] text-gray-5 hover:text-cream transition-colors"
              >
                Take a tour ↗
              </button>
            </div>

            {missingProfile.length > 0 && (
              <Link
                href="/profile"
                className="group mb-2 flex items-center justify-between gap-3 rounded-2xl border-[0.5px] border-sage-light/30 bg-sage-light/[0.06] px-5 py-3.5 transition-colors hover:bg-sage-light/[0.12]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[18px] flex-shrink-0">✨</span>
                  <div className="min-w-0">
                    <div className="animate-text-glow text-[14px] font-semibold text-cream">
                      Complete your profile for better discovery
                    </div>
                    <div className="text-[12px] text-gray-5 truncate">
                      Add your{" "}
                      {missingProfile.length === 1
                        ? missingProfile[0]
                        : `${missingProfile
                            .slice(0, -1)
                            .join(", ")} & ${missingProfile[missingProfile.length - 1]}`}{" "}
                      to stand out.
                    </div>
                  </div>
                </div>
                <span className="text-sage-light text-[18px] flex-shrink-0 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            )}

            <div data-tour="matches">
              <TopMatchesRow
                you={{ name, avatar }}
                matches={topMatches}
                total={matchCount}
              />
            </div>

            <div className="mt-10">
              <FiltersPanel
                intent={intent}
                setIntent={setIntent}
                domain={domain}
                setDomain={setDomain}
                userType={userType}
                setUserType={setUserType}
                location={location}
                setLocation={setLocation}
                interest={interest}
                setInterest={setInterest}
                goal={goal}
                setGoal={setGoal}
                skill={skill}
                setSkill={setSkill}
                showMore={showMoreFilters}
                setShowMore={setShowMoreFilters}
                ready={ready}
                onFindCrows={runSearch}
              />
            </div>
          </div>

          <div className="relative z-10 mt-10 flex justify-center">
            <div className="w-full max-w-[440px]">
              {showEmpty ? (
                <EmptyState />
              ) : !searchStarted ? null : loading ? (
                <SearchStatus message="Finding crows…" />
              ) : searchError ? (
                <SearchStatus message={searchError} tone="error" onRetry={runSearch} />
              ) : current ? (
                <>
                  <div className="flex items-center justify-between mb-4 text-[12px] text-gray-5">
                    <button
                      type="button"
                      onClick={() => setSearchStarted(false)}
                      className="hover:text-cream transition-colors"
                    >
                      ← Edit search
                    </button>
                    <div className="flex items-center gap-3">
                      <span>
                        {currentIdx + 1} of {results.length}
                      </span>
                      <button
                        type="button"
                        onClick={sounds.toggle}
                        aria-label={
                          sounds.enabled ? "Mute swipe sounds" : "Enable swipe sounds"
                        }
                        title={sounds.enabled ? "Sounds on" : "Sounds off"}
                        className={`w-7 h-7 rounded-full border-[0.5px] flex items-center justify-center transition-colors ${
                          sounds.enabled
                            ? "border-white/25 text-cream hover:border-white/40"
                            : "border-gray-3 text-gray-5 hover:text-cream hover:border-white/20"
                        }`}
                      >
                        {sounds.enabled ? <SoundOnIcon /> : <SoundOffIcon />}
                      </button>
                    </div>
                  </div>
                  <ProfileCard
                    profile={current}
                    dragX={dragX}
                    exitDir={exitDir}
                    isDragging={dragStartRef.current !== null}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onExpand={() => setExpanded(true)}
                    isLiked={isLiked}
                    onToggleLike={toggleLike}
                  />
                  <div className="flex items-center justify-center gap-5 mt-6">
                    <ActionButton
                      kind="skip"
                      onClick={() => commitSwipe("left")}
                      ariaLabel="Skip"
                    />
                    <ActionButton
                      kind="info"
                      onClick={() => setExpanded(true)}
                      ariaLabel="View"
                    />
                    <ActionButton
                      kind="like"
                      onClick={() => commitSwipe("right")}
                      ariaLabel="Like"
                    />
                  </div>
                  <p className="text-center text-[12px] text-gray-5 mt-5">
                    Swipe right to connect · Swipe left to skip
                  </p>
                </>
              ) : (
                <NoMoreCrows
                  onReset={() => {
                    setCurrentIdx(0);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {current && (
        <ProfileDetailModal
          open={expanded}
          profile={current}
          onClose={() => setExpanded(false)}
        />
      )}

      <MatchCelebrationModal
        match={matchedWith}
        onClose={() => setMatchedWith(null)}
      />
    </div>
  );
}

function MatchCelebrationModal({
  match,
  onClose,
}: {
  match: Profile | null;
  onClose: () => void;
}) {
  if (!match) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-[400px] w-full mx-4 rounded-3xl border-[0.5px] border-white/15 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <div className="text-[64px] mb-4 animate-icon-glow inline-block">🪶</div>
        <h2 className="font-syne text-[26px] font-extrabold tracking-[-0.8px] text-cream mb-2">
          It&apos;s a match!
        </h2>
        <p className="text-[14px] text-gray-5 mb-6">
          You and <span className="text-cream">{match.name}</span> both swiped right.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/matches"
            className="px-5 py-[12px] rounded-full text-[13px] text-cream border-[0.5px] border-white/30 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md hover:from-white/35 hover:to-white/15 transition-all"
          >
            View matches
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-[12px] rounded-full text-[13px] text-gray-5 border-[0.5px] border-gray-3 hover:text-cream hover:border-white/20 transition-colors"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ Filters */

function FiltersPanel({
  intent,
  setIntent,
  domain,
  setDomain,
  userType,
  setUserType,
  location,
  setLocation,
  interest,
  setInterest,
  goal,
  setGoal,
  skill,
  setSkill,
  showMore,
  setShowMore,
  ready,
  onFindCrows,
}: {
  intent: string;
  setIntent: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  userType: string;
  setUserType: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  interest: string;
  setInterest: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  skill: string;
  setSkill: (v: string) => void;
  showMore: boolean;
  setShowMore: (v: boolean) => void;
  ready: boolean;
  onFindCrows: () => void;
}) {
  const activeFilters = [userType, location, interest, goal, skill].filter(
    Boolean
  );
  const hasMoreActive = activeFilters.length > 0;
  const HiddenLabel = (
    <span
      aria-hidden="true"
      className="text-[11px] uppercase tracking-[0.14em] opacity-0 select-none"
    >
      .
    </span>
  );

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border-[0.5px] border-white/10 bg-gray-1/40 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div data-tour="intent" className="flex-1 min-w-0">
          <Field label="Intent">
            <GlassSelect
              value={intent}
              onChange={setIntent}
              options={INTENTS}
              placeholder="Why are you here?"
              searchable
              searchPlaceholder="Search intents…"
            />
          </Field>
        </div>

        <div data-tour="domain" className="flex-1 min-w-0">
          <Field label="Domain">
            <GlassSelect
              value={domain}
              onChange={setDomain}
              options={DOMAINS}
              placeholder="Pick a field"
              searchable
              searchPlaceholder="Search domains…"
              allowCustom
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {HiddenLabel}
          <button
            type="button"
            data-tour="advanced"
            onClick={() => setShowMore(!showMore)}
            aria-pressed={showMore}
            className={`inline-flex items-center gap-2 px-4 h-[44px] rounded-full text-[12px] border-[0.5px] cursor-pointer transition-colors ${
              showMore
                ? "text-cream border-white/30 bg-white/[0.06]"
                : "text-gray-5 border-gray-3 hover:text-cream hover:border-white/20"
            }`}
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
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            Advanced filters
            {hasMoreActive && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-semibold text-ink bg-sage-light">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {HiddenLabel}
          <button
            type="button"
            data-tour="find"
            onClick={onFindCrows}
            disabled={!ready}
            className="inline-flex items-center justify-center gap-2 px-5 h-[44px] rounded-full text-[13px] font-medium cursor-pointer text-cream border-[0.5px] border-white/30 bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_14px_rgba(0,0,0,0.3)] transition-all duration-150 hover:from-white/35 hover:to-white/15 hover:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-white/25 disabled:hover:to-white/10 disabled:hover:scale-100 disabled:bg-gradient-to-b"
          >
            Find crows →
          </button>
        </div>
      </div>

      {showMore && (
        <div className="mt-1 pt-4 border-t border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-cream font-medium">
                Advanced filters
              </span>
              {hasMoreActive && (
                <span className="text-[10px] text-gray-5">
                  · {activeFilters.length} active
                </span>
              )}
            </div>
            {hasMoreActive && (
              <button
                type="button"
                onClick={() => {
                  setUserType("");
                  setLocation("");
                  setInterest("");
                  setGoal("");
                  setSkill("");
                }}
                className="text-[11px] text-gray-5 hover:text-cream transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Looking for">
              <GlassSelect
                value={userType}
                onChange={setUserType}
                options={USER_TYPES}
                placeholder="Anyone"
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full bg-gray-1/50 backdrop-blur-md border-[0.5px] border-white/10 rounded-full px-5 py-[11px] text-cream text-sm outline-none placeholder:text-gray-4 transition-colors focus:border-white/30"
              />
            </Field>
            <Field label="Interest">
              <GlassSelect
                value={interest}
                onChange={setInterest}
                options={INTEREST_OPTIONS}
                placeholder="Any interest"
              />
            </Field>
            <Field label="Goal">
              <GlassSelect
                value={goal}
                onChange={setGoal}
                options={GOAL_OPTIONS}
                placeholder="Any goal"
              />
            </Field>
            <Field label="Skill" className="sm:col-span-2">
              <GlassSelect
                value={skill}
                onChange={setSkill}
                options={SKILL_OPTIONS}
                placeholder="Any skill"
              />
            </Field>
          </div>
        </div>
      )}
    </div>
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

/* ============================================================ Empty state */

function EmptyState() {
  return (
    <div className="relative rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/60 to-gray-2/40 backdrop-blur-xl px-8 py-16 text-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(106,171,122,0.16) 0%, rgba(224,155,69,0.08) 45%, transparent 75%)",
        }}
      />

      <div className="relative">
        <div className="text-[52px] mb-5 inline-block animate-icon-glow">
          🪶
        </div>
        <h2 className="font-syne text-[24px] font-extrabold tracking-[-0.6px] text-cream mb-4">
          Pick your intent and domain
        </h2>
        <p className="text-[16px] leading-[1.65] font-light text-cream max-w-[380px] mx-auto animate-text-glow">
          You deserve a good connection. Tell us what you're looking for and where, and we'll find your flock.
        </p>
      </div>
    </div>
  );
}

function SearchStatus({
  message,
  tone = "info",
  onRetry,
}: {
  message: string;
  tone?: "info" | "error";
  onRetry?: () => void;
}) {
  const isError = tone === "error";
  return (
    <div className="rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/60 to-gray-2/40 backdrop-blur-xl px-8 py-14 text-center">
      <div className="text-[40px] mb-4 inline-block">{isError ? "⚠️" : "🪶"}</div>
      <p
        className={`text-[15px] leading-[1.6] max-w-[360px] mx-auto ${
          isError ? "text-cream" : "text-cream animate-text-glow"
        }`}
      >
        {message}
      </p>
      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 px-5 py-2 rounded-full border-[0.5px] border-white/25 text-[13px] text-cream hover:border-white/40 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function NoMoreCrows({ onReset }: { onReset: () => void }) {
  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div
        className="relative rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/80 to-gray-2/60 backdrop-blur-xl px-8 py-14 text-center overflow-hidden"
        style={{
          boxShadow:
            "0 0 50px rgba(106,171,122,0.18), 0 0 100px rgba(224,155,69,0.12), 0 22px 50px -16px rgba(0,0,0,0.6)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(106,171,122,0.18) 0%, rgba(224,155,69,0.08) 50%, transparent 80%)",
          }}
        />
        <div className="relative">
          <div className="text-[52px] mb-4 inline-block animate-icon-glow">
            🪶
          </div>
          <p className="font-syne text-[22px] text-cream font-extrabold mb-2 tracking-[-0.4px]">
            That's everyone for now
          </p>
          <p className="text-[13px] text-gray-5 mb-7 leading-[1.55] max-w-[300px] mx-auto">
            You've seen all the crows matching this. Try a different intent or domain.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="text-cream border-[0.5px] border-white/30 px-6 py-2.5 rounded-full text-[13px] font-medium bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_14px_rgba(0,0,0,0.3)] hover:from-white/35 hover:to-white/15 transition-all"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ Profile card */

function ProfileCard({
  profile,
  dragX,
  exitDir,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onExpand,
  isLiked,
  onToggleLike,
}: {
  profile: Profile;
  dragX: number;
  exitDir: "left" | "right" | null;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onExpand: () => void;
  isLiked: (profileId: string, key: string) => boolean;
  onToggleLike: (profileId: string, key: string) => void;
}) {
  const accent = ACCENT[profile.accent];
  const rotation = dragX * 0.05;
  const transform = exitDir
    ? `translate3d(${exitDir === "right" ? 1000 : -1000}px, 0, 0) rotate(${exitDir === "right" ? 30 : -30}deg)`
    : `translate3d(${dragX}px, 0, 0) rotate(${rotation}deg)`;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative rounded-3xl select-none p-6"
      style={{
        transform,
        transition: isDragging
          ? undefined
          : exitDir
            ? "transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)"
            : "transform 240ms ease-out",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        background:
          "linear-gradient(180deg, rgba(26,26,26,0.95) 0%, rgba(36,36,36,0.9) 100%)",
        border: `1px solid ${accent.border}`,
        boxShadow: `0 0 0 1px ${accent.border}, 0 0 50px ${accent.soft}, 0 0 100px ${accent.soft.replace("0.55", "0.18").replace("0.5", "0.16")}, 0 20px 40px rgba(0,0,0,0.5)`,
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="flex-shrink-0 w-[68px] h-[68px] rounded-full flex items-center justify-center text-[34px] border-[1.5px]"
          style={{
            background: "rgba(10,10,10,0.55)",
            borderColor: accent.color,
            boxShadow: `0 0 0 3px ${accent.color}22, inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px ${accent.soft}`,
          }}
        >
          <span>{profile.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-syne text-[22px] font-bold text-cream tracking-[-0.6px] leading-tight mb-1">
            {profile.name}
          </h2>
          <div className="text-[13px] text-gray-5">{profile.role}</div>
          <div className="text-[12px] text-gray-5">
            {profile.location} · {profile.experience} yr
            {profile.experience === 1 ? "" : "s"}
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border-[0.5px] flex-shrink-0 mt-1"
          style={{ borderColor: `${accent.color}66`, color: accent.color }}
        >
          {TYPE_LABEL[profile.type]}
        </span>
      </div>

      {profile.currentlyWorkingOn && (
        <div
          className="relative mb-4 px-4 py-3 pr-10 rounded-xl border-[0.5px]"
          style={{
            borderColor: `${accent.color}44`,
            background: `linear-gradient(180deg, ${accent.color}10, transparent)`,
          }}
        >
          <div className="flex items-start gap-2">
            <span className="text-[14px] leading-tight">⚡</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-0.5">
                Currently working on
              </div>
              <p className="text-[12.5px] text-cream leading-[1.45] font-light">
                {profile.currentlyWorkingOn}
              </p>
            </div>
          </div>
          <LikeHeart
            active={isLiked(profile.id, "workingOn")}
            accent={accent.color}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(profile.id, "workingOn");
            }}
            position="absolute"
            className="top-2 right-2"
          />
        </div>
      )}

      {profile.goals && profile.goals.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            🚀 Goals
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.goals.slice(0, 3).map((g) => {
              const key = `goal:${g}`;
              const on = isLiked(profile.id, key);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(profile.id, key);
                  }}
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border-[0.5px] transition-all cursor-pointer ${
                    on ? "" : "hover:bg-white/[0.04]"
                  }`}
                  style={{
                    color: on ? accent.color : accent.color,
                    borderColor: on ? accent.color : `${accent.color}55`,
                    background: on ? `${accent.color}22` : `${accent.color}10`,
                  }}
                >
                  {g}
                  <LikeHeart
                    active={on}
                    accent={accent.color}
                    size={12}
                    inline
                    onClick={() => onToggleLike(profile.id, key)}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {profile.findMeFor && profile.findMeFor.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            People can find me for
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.findMeFor.slice(0, 3).map((t) => {
              const key = `find:${t}`;
              const on = isLiked(profile.id, key);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(profile.id, key);
                  }}
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border-[0.5px] transition-all cursor-pointer ${
                    on
                      ? "text-cream border-white/30 bg-white/[0.08]"
                      : "text-gray-5 border-gray-3 bg-transparent hover:text-cream hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  {t}
                  <LikeHeart
                    active={on}
                    accent={accent.color}
                    size={12}
                    inline
                    onClick={() => onToggleLike(profile.id, key)}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
          Skills
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-[11px] text-cream border-[0.5px] border-white/15 bg-white/[0.06] px-2.5 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
          Interests
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.interests.slice(0, 3).map((i) => (
            <span
              key={i}
              className="text-[11px] text-gray-5 border-[0.5px] border-gray-3 px-2.5 py-1 rounded-full"
            >
              {i}
            </span>
          ))}
        </div>
      </div>

      {profile.showcase && profile.showcase.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="mb-4 w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-medium text-sage-light border-[0.5px] border-sage-light/40 bg-sage-light/[0.06] rounded-full py-2 hover:bg-sage-light/[0.12] transition-colors"
        >
          🏆 See my showcase →
        </button>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#222]">
        <span
          className="text-[11px] uppercase tracking-[0.14em]"
          style={{ color: accent.color }}
        >
          ↗ {profile.intent}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="text-[11px] text-gray-5 hover:text-cream transition-colors"
        >
          View full profile →
        </button>
      </div>

      {dragX > 24 && !exitDir && (
        <div
          className="absolute top-6 left-6 px-4 py-1 rounded-lg border-[2px] font-syne font-extrabold text-[20px] tracking-[0.1em] rotate-[-18deg]"
          style={{
            color: "#6aab7a",
            borderColor: "#6aab7a",
            opacity: Math.min(dragX / 100, 1),
          }}
        >
          LIKE
        </div>
      )}
      {dragX < -24 && !exitDir && (
        <div
          className="absolute top-6 right-6 px-4 py-1 rounded-lg border-[2px] font-syne font-extrabold text-[20px] tracking-[0.1em] rotate-[18deg]"
          style={{
            color: "#e08080",
            borderColor: "#e08080",
            opacity: Math.min(-dragX / 100, 1),
          }}
        >
          NOPE
        </div>
      )}
    </div>
  );
}

function LikeHeart({
  active,
  accent,
  size = 13,
  onClick,
  position,
  className,
  inline,
}: {
  active: boolean;
  accent: string;
  size?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  position?: "absolute";
  className?: string;
  inline?: boolean;
}) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={active ? accent : "none"}
      stroke={active ? accent : "#888"}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: active ? `drop-shadow(0 0 6px ${accent}88)` : "none",
        transition: "all 150ms",
        transform: active ? "scale(1.05)" : "scale(1)",
      }}
      aria-hidden="true"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );

  if (inline) {
    // Render as a clickable span so the icon itself is hit-targetable
    // even when nested inside another button.
    return (
      <span
        role="button"
        tabIndex={0}
        aria-pressed={active}
        aria-label={active ? "Remove like" : "Like"}
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }
        }}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }
        }}
        className="inline-flex items-center justify-center transition-transform duration-150 hover:scale-[1.18] cursor-pointer"
      >
        {svg}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove like" : "Like"}
      className={`${position === "absolute" ? "absolute" : ""} ${className ?? ""} w-7 h-7 flex items-center justify-center rounded-full border-[0.5px] border-white/15 bg-ink/40 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 transition-all cursor-pointer`}
    >
      {svg}
    </button>
  );
}

function ActionButton({
  kind,
  onClick,
  ariaLabel,
}: {
  kind: "skip" | "info" | "like";
  onClick: () => void;
  ariaLabel: string;
}) {
  const isInfo = kind === "info";
  const color =
    kind === "skip" ? "#e08080" : kind === "like" ? "#6aab7a" : "#aaaaaa";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${
        isInfo ? "w-11 h-11" : "w-14 h-14"
      } rounded-full border-[1px] bg-gray-1/60 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_14px_rgba(0,0,0,0.4)]`}
      style={{ borderColor: `${color}66` }}
    >
      {kind === "skip" && (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      {kind === "info" && (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )}
      {kind === "like" && (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

/* ============================================================ Detail modal */

function ProfileDetailModal({
  open,
  profile,
  onClose,
}: {
  open: boolean;
  profile: Profile;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const accent = ACCENT[profile.accent];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-ink/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-3xl border-[0.5px] border-white/10 bg-gradient-to-b from-gray-1/95 to-gray-2/95 backdrop-blur-xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-2/60 border-[0.5px] border-white/10 flex items-center justify-center text-gray-5 hover:text-cream transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-[38px] border-[1.5px]"
            style={{
              background: "rgba(10,10,10,0.55)",
              borderColor: accent.color,
              boxShadow: `0 0 0 3px ${accent.color}22, 0 0 30px ${accent.soft}`,
            }}
          >
            <span>{profile.emoji}</span>
          </div>
          <div>
            <h2 className="font-syne text-[26px] font-bold text-cream tracking-[-0.6px] leading-tight">
              {profile.name}
            </h2>
            <div className="text-[13px] text-gray-5">
              {profile.role} · {profile.location}
            </div>
            <div className="text-[12px] text-gray-5 mt-1">
              {TYPE_LABEL[profile.type]} · {profile.experience} yr
              {profile.experience === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <section className="mb-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-1">
              Domain
            </div>
            <div className="text-[14px] text-cream">{profile.domain}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-1">
              Looking for
            </div>
            <div className="text-[14px] text-cream capitalize">
              {profile.intent}
            </div>
          </div>
        </section>

        <section className="mb-5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            All skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <span
                key={s}
                className="text-[12px] text-cream border-[0.5px] border-white/15 bg-white/[0.06] px-3 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        <section>
          <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
            Interests
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <span
                key={i}
                className="text-[12px] text-gray-5 border-[0.5px] border-gray-3 px-3 py-1 rounded-full"
              >
                {i}
              </span>
            ))}
          </div>
        </section>

        {profile.showcase && profile.showcase.length > 0 && (
          <section>
            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-5 mb-2">
              🏆 Showcase
            </div>
            <ShowcaseList items={profile.showcase} />
          </section>
        )}
      </div>
    </div>
  );
}

/* ============================================================ Icons */

function SoundOnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

/* ============================================================ Sounds */

function useSwipeSounds() {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crowhub:sounds");
      if (saved === "0") setEnabled(false);
    } catch {}
  }, []);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("crowhub:sounds", next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (ctxRef.current) return ctxRef.current;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      ctxRef.current = new AC();
      return ctxRef.current;
    } catch {
      return null;
    }
  }

  function play(kind: "accept" | "decline") {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") void ctx.resume();
      playWaterDrop(ctx, kind);
    } catch {}
  }

  return { enabled, toggle, play };
}

function playWaterDrop(
  ctx: AudioContext,
  variant: "accept" | "decline"
) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);

  // --- Main "drop" tone with frequency sweep
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";

  if (variant === "accept") {
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.18);
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.5, now + 0.006);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
  } else {
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.45, now + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
  }

  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(now + 0.45);

  // --- Splash texture: filtered noise burst at the moment of "impact"
  const noiseLen = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = variant === "accept" ? 2600 : 1600;
  noiseFilter.Q.value = 1.2;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(variant === "accept" ? 0.18 : 0.14, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
  noise.stop(now + 0.1);
}
