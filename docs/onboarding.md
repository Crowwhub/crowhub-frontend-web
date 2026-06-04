# CrowHub Onboarding

Eight-step funnel that runs after `/auth/signup` → `/auth/verify-email`. Every step writes its answers into a single `localStorage` object (`crowhub:profile`) which the rest of the app — Home, Profile, Matches, Chat — reads back.

```
/auth/signup
  → /auth/verify-email
    → /auth/onboarding              (1/8 — profile)
    → /auth/onboarding/personal     (2/8 — birthday, gender, location)
    → /auth/onboarding/role         (3/8 — role + experience)
    → /auth/onboarding/skills       (4/8 — skills)
    → /auth/onboarding/purpose      (5/8 — purpose drag/drop)
    → /auth/onboarding/interests    (6/8 — interests)
    → /auth/onboarding/goals        (7/8 — goals + popup)
    → /auth/onboarding/working-on   (8/8 — currently working on)
    → /home
```

The progress indicator (`components/OnboardingProgress.tsx`) shows the current step out of 8 at the top-right of each page.

---

## 1. Profile — `/auth/onboarding` (1/8)

**Heading**: "Let's set up your profile 😊"
**Subtitle**: "Add your name and photo so people can recognize you"

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text input | ✅ | Full name. First word is used for greetings everywhere. |
| `avatar` | emoji picker | ✅ | One of 7 bird emojis (🐦‍⬛, 🦉, 🦅, 🐧, 🦆, 🦢, 🦜). Default 🐦‍⬛. |

**Persistence** — `crowhub:name`, `crowhub:avatar`, and merges `{ name, avatar }` into `crowhub:profile`.

**Next** → `/auth/onboarding/personal`

---

## 2. Personal — `/auth/onboarding/personal` (2/8)

**Heading**: "A little about you ✨"
**Subtitle**: "So people can find their kind of flock — and so we can wish you on the right day."

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `birthday` | `<input type="date">` | ✅ | ISO date string. Used by the birthday popup. |
| `gender` | `GlassSelect` | ❌ | Male / Female / Non-binary / Prefer not to say. |
| `location` | text input | ❌ | City, country style. |

**Special behavior — Birthday celebration popup**
On submit, the page computes `daysAway` between today and the birthday's month/day this year. If `|daysAway| ≤ 30`, a modal fires before navigating:

| Case | Title | Emoji |
|---|---|---|
| `daysAway === 0` | "Hey {name}, it's your birthday!" | 🎂 |
| `daysAway > 0` | "{name}, your birthday is incoming!" | 🎈 |
| `daysAway < 0` | "Hope your birthday was lovely, {name}!" | 🎉 |

The popup is dismissed via the "Awesome, let's go →" button, backdrop click, or `Esc`. Dismissal always proceeds to the next step. Glass card on a dark backdrop, sage+amber halo shadow, `animate-icon-glow` + `animate-text-glow` on the emoji and title.

**Persistence** — merges `{ birthday, gender, location }` into `crowhub:profile`.

**Next** → `/auth/onboarding/role`

---

## 3. Role — `/auth/onboarding/role` (3/8)

**Heading**: "What do you do?"
**Subtitle**: "Tell us about your work so we can connect you with the right people."

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `GlassSelect` | ✅ | Student / Working Professional / Freelancer. |
| `domain` | `GlassSelect` | ✅ | 15 options (Software Developer, Designer, Singer, Artist, etc.). |
| `experience` | number input | ✅ | "Professional exp." — years in paid work. |
| `practiceYears` | number input | ✅ | "Practicing exp." — years including learning. |

Microcopy explains that practicing time includes learning, not just paid work.

**Persistence** — merges `{ type, domain, experience, practiceYears }` into `crowhub:profile`.

**Next** → `/auth/onboarding/skills`

---

## 4. Skills — `/auth/onboarding/skills` (4/8)

**Heading**: "What can you do?"
**Subtitle**: "Add your skills so people can find you and your work."

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `skills` | searchable multi-select chips | ✅ (≥1 to submit) | Live-filter from a list of ~80 skills across programming, design, data, music, art, photography, writing, business. |

**Behavior**
- Search input at the top; results below filtered case-insensitive by `.includes(query)`.
- Selected skills shown above the suggestion list as removable chips (✕).
- Counter ("N skills selected") below.
- Next button disabled until at least one skill is selected.

**Persistence** — merges `{ skills }` into `crowhub:profile`.

**Next** → `/auth/onboarding/purpose`

---

## 5. Purpose — `/auth/onboarding/purpose` (5/8)

**Heading**: "Why are you here? 🤔"
**Subtitle**: "Pick what matters to you, then drag in the order that works best for you"

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `purposes` | drag-and-drop ordered list | ❌ | 4 options: Project Collab, Hiring, Referral, Networking. |

**Behavior**
- Checking a row moves it to the **selected** group at the top (filled checkbox + drag handle appears).
- Native HTML5 drag-and-drop reorders selected rows. Source row gets `opacity-40`; hovered drop target gets a 2px white ring.
- Unselected options stay in the bottom group, not draggable.
- Click the filled checkbox to deselect (drops back to bottom group).

**Persistence** — merges `{ purposes }` (an ordered string array) into `crowhub:profile`.

**Next** → `/auth/onboarding/interests`

---

## 6. Interests — `/auth/onboarding/interests` (6/8)

**Heading**: "What are your other interests? ✨"
**Subtitle**: "Choose what aligns with your interests"

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `interests` | searchable multi-select chips with emoji | ❌ | 18 options (Frontend Development, AI & Machine Learning, Cloud & DevOps, Mobile Development, Open Source, etc.). |

**Behavior**
- Search input filters the chip pool live.
- Selected chips appear above with a ✕ to remove; popular/results chips below add to selected.
- "Popular" / "Results" label switches based on whether search has a query.

**Persistence** — merges `{ interests }` into `crowhub:profile`.

**Next** → `/auth/onboarding/goals`

---

## 7. Goals — `/auth/onboarding/goals` (7/8)

**Heading**: "What's your goal, {name}? 🚀"
**Subtitle**: "Optional — but the flock connects faster when they know what you're chasing."

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `goals` | typeable + popular-pick chips | ❌ | User can type a custom goal and press Enter to add. 12 popular goals available as suggestions. |

**Popular goals** seeded in the page:
> Land a job at FAANG, Compose original music, Build a profitable side project, Join a top design studio, Travel and work remotely, Publish a book, Start my own company, Learn machine learning, Speak at a conference, Become a full-time freelancer, Make my first $100k, Get featured in Wired.

**Special behavior — Appreciation popup**
On Next click, if `goals.length > 0` a celebratory popup fires before navigating:

- 🌟 emoji with `animate-icon-glow`
- Title: "Buddy, you've got goals!" with `animate-text-glow`
- Subtitle adapts to count:
  - 1 goal: "One goal already. Ambition looks good on you, {name}…"
  - 2+ goals: "{N} goals locked in. Ambition looks good on you, {name}…"
- "Let's go →" button proceeds; backdrop click + `Esc` also dismiss + proceed.

**Skip button** — persists `goals: []` and proceeds without showing the popup.

**Persistence** — merges `{ goals }` into `crowhub:profile`.

**Next** → `/auth/onboarding/working-on`

---

## 8. Currently working on — `/auth/onboarding/working-on` (8/8)

**Heading**: "What are you working on, {name}? ⚡"
**Subtitle**: "Optional — a single sentence on what's keeping you busy right now. Helps people start a real conversation."

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `currentlyWorkingOn` | textarea | ❌ | One-sentence freeform text. Example placeholder provided. |

**Skip button** — persists empty string and finishes.

**Persistence** — merges `{ currentlyWorkingOn }` into `crowhub:profile`.

**Next** → `/home`

---

## Data Model

All onboarding answers merge into a single localStorage object at `crowhub:profile`. Legacy keys `crowhub:name` and `crowhub:avatar` are also written for backward compatibility (sidebar greeting, etc.).

```ts
type ProfileData = {
  // Step 1
  name: string;
  avatar: string;            // emoji

  // Step 2
  birthday: string;          // ISO date "YYYY-MM-DD"
  gender: "" | "male" | "female" | "non-binary" | "prefer-not-to-say";
  location: string;

  // Step 3
  type: "" | "student" | "professional" | "freelancer";
  domain: string;
  experience: number;        // years of paid work
  practiceYears: number;     // years including learning

  // Step 4
  skills: string[];

  // Step 5
  purposes: string[];        // ordered

  // Step 6
  interests: string[];

  // Step 7
  goals: string[];

  // Step 8
  currentlyWorkingOn: string;
};
```

The Profile page (`/profile`) reads this object on mount and lets the user edit every field.

---

## Components

- **`components/OnboardingProgress.tsx`** — Pill-bar progress indicator. Props: `current: number`, `total: number`. Renders `total` thin bars; the first `current` are cream, the rest gray-3.
- **`components/GlassSelect.tsx`** — Glass-styled dropdown used for type, domain, intent, gender. Click-outside close, keyboard `aria-haspopup` semantics, smooth chevron rotation.

---

## Reading data elsewhere

| Surface | What it reads | Where |
|---|---|---|
| Home greeting | `crowhub:name` | `app/home/page.tsx` |
| Profile page | `crowhub:profile` (full object) | `app/profile/page.tsx` |
| Sidebar logout | clears `crowhub:name`, `crowhub:avatar`, `crowhub:profile`, `crowhub:sounds`, notification keys | `components/Sidebar.tsx` |
| Profile preview card | `currentlyWorkingOn`, `goals` shown above skills/interests | `app/profile/page.tsx` |

---

## Navigation rules

- **Back button** on every step uses `router.back()` — naturally walks the user back one URL in history.
- **Next/Skip** always `router.push(<next route>)` after persisting.
- If a user lands directly on a later step via URL (e.g., bookmarked `/auth/onboarding/role`), the page reads any prior values from `crowhub:profile` and pre-fills inputs, so partial progress is preserved across reloads.

---

## Animation primitives used

Defined in `app/globals.css`:

| Class | Effect |
|---|---|
| `animate-icon-glow` | `drop-shadow` pulse between sage and amber halos (4s) — used on celebratory emojis. |
| `animate-text-glow` | `text-shadow` pulse between sage / amber / cream (4s) — used on celebratory popup titles and the empty-state radiating text. |
| `animate-pulse-dot` | Opacity pulse for the small "open beta" dot and similar indicators. |
| `animate-blob-1`, `animate-blob-2`, `animate-blob-3` | Slow drifting / scaling translations for the ambient background blobs behind the auth shell. |
