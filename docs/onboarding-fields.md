# Onboarding — Field Reference

Field-by-field spec for the backend. Each section lists the endpoint, every field, its type, whether it's required, and validation rules.

Legend: ✅ = required, ⚪ = optional.

---

## Auth

### Signup — `POST /auth/signup`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `email` | string | ✅ | RFC email; lowercased; unique |
| `password` | string | ✅ | length ≥ 8 |

**Example**
```json
{ "email": "user@example.com", "password": "long-enough" }
```

**Response (201)**
```json
{
  "userId": "u_01H...",
  "email": "user@example.com",
  "emailVerified": false
}
```

**Side effects**: generate a 6-digit OTP and email it.

---

### Resend OTP — `POST /auth/verify-email`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `email` | string | ✅ | RFC email; must exist; 30s cooldown enforced server-side |

**Response (200)**
```json
{ "ok": true, "cooldownSeconds": 30 }
```

---

### Confirm OTP — `POST /auth/verify-email/confirm`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `email` | string | ✅ | RFC email |
| `code` | string | ✅ | exactly 6 digits; matches latest issued OTP; TTL 10 min; max 5 attempts |

**Response (200)**
```json
{
  "userId": "u_01H...",
  "email": "user@example.com",
  "emailVerified": true,
  "onboardingComplete": false,
  "session": { "token": "...", "expiresAt": "2026-06-21T10:00:00Z" }
}
```

---

### Login — `POST /auth/login`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `email` | string | ✅ | RFC email |
| `password` | string | ✅ | length ≥ 8 |

**Response (200)** — same shape as `verify-email/confirm`.

---

### Logout — `POST /auth/logout`

No body. Invalidates the current session.

---

## Onboarding steps

All onboarding endpoints use a single partial-update endpoint:

```
PATCH /me/profile
Authorization: Bearer <session-token>
```

The frontend calls it after each step's "Next" click with only the keys for that step. Backend merges into the existing profile. The response is the full merged profile.

---

### Step 1 — Profile · `/auth/onboarding`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `name` | string | ✅ | 1–80 chars, trimmed |
| `avatar` | string | ✅ | emoji; one of the 7 picks ("🐦‍⬛", "🦉", "🦅", "🐧", "🦆", "🦢", "🦜") |

**Payload**
```json
{ "name": "Subham", "avatar": "🐦‍⬛" }
```

---

### Step 2 — Personal · `/auth/onboarding/personal`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `birthday` | string (ISO date `YYYY-MM-DD`) | ✅ | valid date; age ≥ 13 |
| `gender` | string | ✅ | one of `"male"`, `"female"`, `"non-binary"`, `"prefer-not-to-say"` |
| `location` | string | ✅ | 1–80 chars |

**Payload**
```json
{
  "birthday": "1998-04-12",
  "gender": "male",
  "location": "Mumbai"
}
```

> **Birthday popup**: handled entirely on the frontend; if `birthday` falls within ±30 days of today, a celebration modal fires before navigating. Backend doesn't need to know.

---

### Step 3 — Role · `/auth/onboarding/role`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `type` | string | ✅ | one of `"student"`, `"professional"`, `"freelancer"` |
| `domain` | string | ✅ | one of the 15 domain values (see list below) |
| `experience` | integer | ✅ | 0–60 (years of paid work) |
| `practiceYears` | integer | ✅ | 0–80 (years including learning); should be ≥ `experience` |

**Allowed `domain` values**
```
Software Developer, Data Analyst, Designer, Product Manager,
Writer, Photographer, Singer, Musician, Artist, Filmmaker,
Marketing Professional, Educator, Researcher, Entrepreneur, Other
```

**Payload**
```json
{
  "type": "professional",
  "domain": "Software Developer",
  "experience": 4,
  "practiceYears": 8
}
```

---

### Step 4 — Skills · `/auth/onboarding/skills`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `skills` | array of strings | ✅ | length ≥ 1, ≤ 30; each entry 1–40 chars |

Free-text allowed. The frontend ships ~80 suggested skills but the user can type anything.

**Payload**
```json
{ "skills": ["TypeScript", "React", "PostgreSQL"] }
```

---

### Step 5 — Purpose · `/auth/onboarding/purpose`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `purposes` | array of strings (ordered) | ⚪ | each value one of `"Project Collab"`, `"Hiring"`, `"Referral"`, `"Networking"`; order matters (priority) |

**Payload**
```json
{ "purposes": ["Hiring", "Networking"] }
```

---

### Step 6 — Interests · `/auth/onboarding/interests`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `interests` | array of strings | ⚪ | each from the closed 18-item list below; max 18 |

**Allowed `interests` values**
```
Frontend Development, Databases, UI/UX Design, AI & Machine Learning,
Full-Stack Development, Product Strategy, Design System, Cloud & DevOps,
Software Engineering, APIs & Integrations, Product Thinking, Backend Systems,
Data & Analytics, Exploring Opportunities, Networking, Collaboration,
Mobile Development, Open Source
```

**Payload**
```json
{ "interests": ["Frontend Development", "AI & Machine Learning"] }
```

---

### Step 7 — Find me for · `/auth/onboarding/find-me-for`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `findMeFor` | array of strings | ⚪ | 0–30 entries; each 1–60 chars |

Frontend renders **domain-specific** + **universal** options based on the user's `domain` from step 3. The backend should accept any string (whitelist optional).

**Universal options** (shown to everyone):
```
Co-founder, Mentor, Mentee, Coffee chat, Networking buddy,
Side project partner, Travel buddy, Gym partner, Valorant partner,
Matiks squad, Chess opponent, Reading group, Just to chat
```

**Domain-specific examples**:
- *Software Developer*: Leetcode partner, Open source collab, Hackathon teammate, Code review buddy, Tech interview prep, System design study group
- *Designer*: Design critique, Portfolio reviewer, Branding collab, Dribbble buddy, Daily UI partner
- *Data Analyst*: Kaggle teammate, ML study partner, SQL puzzles, Data viz critique, Stats discussion
- *Musician*: Band member, Jam buddy, Producer collab, Co-writer
- *Writer*: Writing partner, Editing buddy, Newsletter collab, Pitch swap, Book club
- (Full per-domain map in `app/auth/onboarding/find-me-for/page.tsx`)

**Payload**
```json
{ "findMeFor": ["Leetcode partner", "Co-founder", "Matiks squad"] }
```

---

### Step 8 — Goals · `/auth/onboarding/goals`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `goals` | array of strings | ⚪ | 0–10 entries; each 1–80 chars |

Free-text + 12 suggested picks. Backend accepts any string.

**Suggested picks**
```
Land a job at FAANG, Compose original music, Build a profitable side project,
Join a top design studio, Travel and work remotely, Publish a book,
Start my own company, Learn machine learning, Speak at a conference,
Become a full-time freelancer, Make my first $100k, Get featured in Wired
```

**Payload**
```json
{ "goals": ["Land a job at FAANG", "Build a profitable side project"] }
```

> **Appreciation popup**: handled on the frontend; if `goals.length > 0`, a "Buddy, you've got goals!" modal fires before navigating.

---

### Step 9 — Currently working on · `/auth/onboarding/working-on`

| Field | Type | Req | Constraints |
|---|---|---|---|
| `currentlyWorkingOn` | string | ⚪ | 0–280 chars |

**Payload**
```json
{ "currentlyWorkingOn": "Designing the onboarding flow for a fintech app." }
```

---

## Finish — `POST /me/onboarding/complete`

Called after step 9 to mark the user fully onboarded. No body.

**Server must verify these are set on the profile**:
- `name` (non-empty)
- `avatar` (non-empty)
- `birthday` (valid date)
- `gender` (one of the 4 enum values)
- `location` (non-empty)
- `type` (one of the 3 enum values)
- `domain` (one of the 15 enum values)
- `experience` (integer ≥ 0)
- `practiceYears` (integer ≥ 0)
- `skills.length ≥ 1`

If any required field is missing, return `409 ONBOARDING_INCOMPLETE`.

**Response (200)**
```json
{
  "userId": "u_01H...",
  "emailVerified": true,
  "onboardingComplete": true,
  "profile": { /* full profile */ }
}
```

---

## Full profile shape

The merged result of all steps. This is what `GET /me` returns and what the `/profile` page reads back.

```ts
interface Profile {
  // Step 1 — required
  name: string;
  avatar: string;

  // Step 2 — all required for completion
  birthday: string;                   // "YYYY-MM-DD"
  gender:
    | "male"
    | "female"
    | "non-binary"
    | "prefer-not-to-say";
  location: string;                   // non-empty

  // Step 3 — all required for completion
  type: "student" | "professional" | "freelancer" | null;
  domain: string | null;
  experience: number;                 // integer ≥ 0
  practiceYears: number;              // integer ≥ 0

  // Step 4 — required (≥ 1) for completion
  skills: string[];

  // Step 5
  purposes: ("Project Collab" | "Hiring" | "Referral" | "Networking")[];

  // Step 6
  interests: string[];

  // Step 7
  findMeFor: string[];

  // Step 8
  goals: string[];

  // Step 9
  currentlyWorkingOn: string;         // "" if not set

  // Editable from /profile but not part of the onboarding flow
  bio: string;
  role: string;                       // job title shown on profile
}
```

---

## Quick summary table

| Step | Endpoint | Required fields | Optional fields |
|---|---|---|---|
| Signup | `POST /auth/signup` | `email`, `password` | — |
| OTP resend | `POST /auth/verify-email` | `email` | — |
| OTP confirm | `POST /auth/verify-email/confirm` | `email`, `code` | — |
| 1 — Profile | `PATCH /me/profile` | `name`, `avatar` | — |
| 2 — Personal | `PATCH /me/profile` | `birthday`, `gender`, `location` | — |
| 3 — Role | `PATCH /me/profile` | `type`, `domain`, `experience`, `practiceYears` | — |
| 4 — Skills | `PATCH /me/profile` | `skills` (≥ 1) | — |
| 5 — Purpose | `PATCH /me/profile` | — | `purposes` |
| 6 — Interests | `PATCH /me/profile` | — | `interests` |
| 7 — Find me for | `PATCH /me/profile` | — | `findMeFor` |
| 8 — Goals | `PATCH /me/profile` | — | `goals` |
| 9 — Working on | `PATCH /me/profile` | — | `currentlyWorkingOn` |
| Finish | `POST /me/onboarding/complete` | — (server checks required fields are present) | — |

---

## Error envelope

```json
{
  "error": {
    "code": "OTP_EXPIRED",
    "message": "Human-readable message",
    "field": "code"
  }
}
```

**Codes the FE handles**:
- `EMAIL_TAKEN`
- `INVALID_CREDENTIALS`
- `OTP_INVALID`, `OTP_EXPIRED`, `OTP_TOO_MANY_ATTEMPTS`
- `RESEND_COOLDOWN`
- `VALIDATION_FAILED` (with `field`)
- `ONBOARDING_INCOMPLETE`
- `UNAUTHORIZED`
