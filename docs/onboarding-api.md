# Onboarding — Backend Spec

This is the contract between the CrowHub frontend (Next.js app) and whatever the backend ends up being. It covers the **signup → email-OTP verify → 9-step onboarding** flow.

Right now the frontend persists every step to `localStorage("crowhub:profile")` and accepts any 6-digit OTP. Everything below is what the backend needs to take over once it's wired up.

---

## 0. Flow at a glance

```
[FE] /auth/signup           → POST /auth/signup
[FE] /auth/verify-email     → POST /auth/verify-email (send OTP)
                            → POST /auth/verify-email/confirm (confirm OTP)
[FE] /auth/onboarding       → PATCH /me/profile  (step 1: name, avatar)
[FE] /auth/onboarding/personal
                            → PATCH /me/profile  (step 2: birthday, gender, location)
[FE] /auth/onboarding/role  → PATCH /me/profile  (step 3: type, domain, experience, practiceYears)
[FE] /auth/onboarding/skills
                            → PATCH /me/profile  (step 4: skills[])
[FE] /auth/onboarding/purpose
                            → PATCH /me/profile  (step 5: purposes[] — ordered)
[FE] /auth/onboarding/interests
                            → PATCH /me/profile  (step 6: interests[])
[FE] /auth/onboarding/find-me-for
                            → PATCH /me/profile  (step 7: findMeFor[])  — optional
[FE] /auth/onboarding/goals → PATCH /me/profile  (step 8: goals[])      — optional
[FE] /auth/onboarding/working-on
                            → PATCH /me/profile  (step 9: currentlyWorkingOn) — optional
                            → POST /me/onboarding/complete
[FE] /home                  → uses authenticated session
```

Each onboarding step is a **partial PATCH** to a single `/me/profile` resource. The frontend will call it on submit of each page. The backend should accept partials and only update the keys it receives. The final page calls `POST /me/onboarding/complete` to mark the user as fully onboarded (a flag, used to gate `/home`).

---

## 1. Authentication

### 1.1 POST `/auth/signup`

Create a new user account in an unverified state and trigger an OTP email.

**Request**
```json
{
  "email": "user@example.com",
  "password": "at-least-8-chars"
}
```

**Validation**
- `email` — valid email format, lowercased, unique
- `password` — min 8 chars (frontend already enforces; backend should re-validate)

**Response (201)**
```json
{
  "userId": "u_01H...",
  "email": "user@example.com",
  "emailVerified": false
}
```

**Side effects**
- Generate a 6-digit OTP, store it server-side with TTL (see §4)
- Send the OTP via email

**Errors**
- `409` — email already in use
- `400` — validation failure

---

### 1.2 POST `/auth/verify-email`

Re-send (or first-send) an OTP. Frontend calls this from the "Resend code" link on `/auth/verify-email`.

**Request**
```json
{ "email": "user@example.com" }
```

**Response (200)**
```json
{ "ok": true, "cooldownSeconds": 30 }
```

The frontend already enforces a 30-second cooldown locally. The backend should also enforce one (e.g., per-email or per-userId) to prevent abuse — return `429` if hit too early.

**Errors**
- `404` — no such email
- `429` — too many requests (cooldown)

---

### 1.3 POST `/auth/verify-email/confirm`

Confirm the 6-digit OTP and start a session.

**Request**
```json
{ "email": "user@example.com", "code": "123456" }
```

**Response (200)**
```json
{
  "userId": "u_01H...",
  "email": "user@example.com",
  "emailVerified": true,
  "onboardingComplete": false,
  "session": {
    "token": "...",
    "expiresAt": "2026-06-21T10:00:00Z"
  }
}
```

Frontend behavior after success: `router.push("/auth/onboarding")`.

**Errors**
- `400` — bad code / expired / too many wrong attempts
- `404` — no pending verification for this email

---

### 1.4 POST `/auth/login`

Standard email+password. Not covered in detail here — but the response should mirror `verify-email/confirm` so the frontend can decide whether to send the user to `/auth/onboarding` (if `onboardingComplete === false`) or `/home`.

```json
{
  "userId": "...",
  "email": "...",
  "emailVerified": true,
  "onboardingComplete": true,
  "session": { "token": "...", "expiresAt": "..." }
}
```

---

### 1.5 POST `/auth/logout`

Invalidate the session. The frontend sidebar logout button clears local state and redirects to `/`.

---

## 2. Profile model

This is the union of every onboarding answer. The backend should persist it as the user record's profile, either inline on the `users` table or as a separate `profiles` table joined 1-1.

```ts
type ProfileType = "student" | "professional" | "freelancer";
type Intent = "networking" | "hiring" | "referral" | "mentorship";
type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";

interface Profile {
  // identity (step 1)
  name: string;            // required after step 1
  avatar: string;          // emoji string; required after step 1

  // personal (step 2)
  birthday: string | null; // ISO "YYYY-MM-DD"
  gender: Gender | null;
  location: string;        // free text city/country

  // work (step 3)
  type: ProfileType | null;
  domain: string | null;       // see DOMAINS list below
  experience: number;          // years of paid work; integer ≥ 0
  practiceYears: number;       // years including learning; integer ≥ 0

  // skills (step 4)
  skills: string[];        // free text; suggested list shipped on FE

  // purposes (step 5, ordered)
  purposes: ("Project Collab" | "Hiring" | "Referral" | "Networking")[];

  // interests (step 6)
  interests: string[];

  // find me for (step 7, optional)
  findMeFor: string[];

  // goals (step 8, optional)
  goals: string[];         // mixed: custom strings + popular picks

  // currently working on (step 9, optional)
  currentlyWorkingOn: string;

  // derived / set by /me/onboarding/complete
  intent: Intent | null;   // FE legacy field; suggest deriving from purposes[0] or omitting
  bio: string;             // optional; not part of the onboarding flow but editable in /profile
}
```

### Enum values shipped from the frontend

The frontend uses these closed lists. Backend should validate against them where applicable.

**`domain`** (step 3)
```
Software Developer, Data Analyst, Designer, Product Manager,
Writer, Photographer, Singer, Musician, Artist, Filmmaker,
Marketing Professional, Educator, Researcher, Entrepreneur, Other
```

**`type`**
```
student, professional, freelancer
```

**`gender`**
```
male, female, non-binary, prefer-not-to-say
```

**`purposes`** (step 5, ordered subset of)
```
Project Collab, Hiring, Referral, Networking
```

**`intent`** (legacy / future)
```
networking, hiring, referral, mentorship
```

**`skills`** (~80 suggestions but free-text allowed) — see `app/auth/onboarding/skills/page.tsx` for the full seed list.

**`interests`** (18 picks, free-text *not* allowed in current UI) — see `app/auth/onboarding/interests/page.tsx`.

**`findMeFor`** — domain-specific + universal options. Backend can accept any string; if validation is required, see `app/auth/onboarding/find-me-for/page.tsx` for the per-domain map. Notable picks: `Leetcode partner`, `Co-founder`, `Hackathon teammate`, `Matiks squad`, `Valorant partner`, `Chess opponent`, etc.

**`goals`** — free-text (user can type any goal) + 12 suggested picks like "Land a job at FAANG", "Compose original music", "Build a profitable side project", etc.

---

## 3. Endpoints — onboarding steps

### 3.1 PATCH `/me/profile`

Partial update. Frontend calls this on each step's submit with only the keys for that step. Backend should:
- Validate each key independently
- Merge into the existing profile
- Return the full profile

**Step 1 — Profile**
```json
{ "name": "Subham", "avatar": "🐦‍⬛" }
```

**Step 2 — Personal**
```json
{
  "birthday": "1998-04-12",
  "gender": "male",
  "location": "Mumbai"
}
```

**Step 3 — Role**
```json
{
  "type": "professional",
  "domain": "Software Developer",
  "experience": 4,
  "practiceYears": 8
}
```

**Step 4 — Skills**
```json
{ "skills": ["TypeScript", "React", "PostgreSQL"] }
```

**Step 5 — Purpose** (ordered array; order matters)
```json
{ "purposes": ["Hiring", "Networking"] }
```

**Step 6 — Interests**
```json
{ "interests": ["Frontend Development", "AI & Machine Learning"] }
```

**Step 7 — Find me for**
```json
{ "findMeFor": ["Leetcode partner", "Co-founder", "Matiks squad"] }
```

**Step 8 — Goals**
```json
{ "goals": ["Land a job at FAANG", "Build a profitable side project"] }
```

**Step 9 — Currently working on**
```json
{ "currentlyWorkingOn": "Designing the onboarding flow for a fintech app." }
```

**Response** — the full merged profile, e.g.:
```json
{
  "userId": "u_01H...",
  "profile": {
    "name": "Subham",
    "avatar": "🐦‍⬛",
    "birthday": "1998-04-12",
    "gender": "male",
    "location": "Mumbai",
    "type": "professional",
    "domain": "Software Developer",
    "experience": 4,
    "practiceYears": 8,
    "skills": ["TypeScript", "React"],
    "purposes": ["Hiring"],
    "interests": [],
    "findMeFor": [],
    "goals": [],
    "currentlyWorkingOn": ""
  }
}
```

**Errors**
- `400` — invalid value for a known key (e.g., bad `type`)
- `401` — unauthenticated

---

### 3.2 POST `/me/onboarding/complete`

Called from the **last step** (`/auth/onboarding/working-on`) when the user clicks "Finish setup". Marks the user as fully onboarded.

Server should:
- Verify required fields are present (see §5)
- Set `onboardingComplete = true`
- Return the user record so the frontend can route to `/home`

**Response**
```json
{
  "userId": "u_01H...",
  "emailVerified": true,
  "onboardingComplete": true,
  "profile": { /* full profile */ }
}
```

**Errors**
- `409` — required field missing (`name`, `avatar`, `birthday`, `type`, `domain`, `experience`, `practiceYears`, `skills.length ≥ 1`)

---

### 3.3 GET `/me`

Single source of truth for the authenticated session. Frontend will use this on app boot to decide where to land.

**Response**
```json
{
  "userId": "u_01H...",
  "email": "user@example.com",
  "emailVerified": true,
  "onboardingComplete": true,
  "profile": { /* full profile, or partial if mid-onboarding */ }
}
```

---

## 4. OTP service

- 6-digit numeric (matches the FE input).
- TTL: **10 minutes** from generation.
- Max attempts per code: **5**, then invalidate and require a new send.
- Cooldown between resends: **30 seconds** (matches FE countdown).
- Single active code per `(userId, email)` — re-issuing overwrites the previous.
- Store as a hashed value, not plaintext.

Frontend behaviors that depend on the backend:
- After typing 6 digits → manual click of **Verify**. Backend should respond fast enough for the FE's 400ms placeholder.
- Resend link is gated by a local 30s timer **and** the server's `429`.
- A code expired or attempted too many times → show an error message above the Verify button and let the user re-request.

---

## 5. Validation rules

Per-field rules the backend should enforce. Frontend enforces most of these too, but they need to be the server's responsibility.

| Field | Rule |
|---|---|
| `email` | RFC-compliant, lowercased, unique |
| `password` | min 8 chars |
| `code` | exactly 6 digits |
| `name` | 1–80 chars, trimmed |
| `avatar` | one of the 7 emojis (or accept any string for forward-compat) |
| `birthday` | valid ISO date, `age ≥ 13` |
| `gender` | one of the 4 enum values, or `null` |
| `location` | 0–80 chars |
| `type` | one of the 3 enum values |
| `domain` | one of the 15 enum values |
| `experience` | integer, 0–60 |
| `practiceYears` | integer, 0–80, `≥ experience` recommended |
| `skills` | 0–30 entries; each 1–40 chars |
| `purposes` | subset of the 4 enum values; order preserved |
| `interests` | 0–18 entries; each from the 18-item enum |
| `findMeFor` | 0–30 entries; free-text |
| `goals` | 0–10 entries; each 1–80 chars |
| `currentlyWorkingOn` | 0–280 chars |

### Required for `onboardingComplete`

The backend should refuse `POST /me/onboarding/complete` unless these are set:
- `name`
- `avatar`
- `birthday`
- `type`
- `domain`
- `experience` (≥ 0)
- `practiceYears` (≥ 0)
- `skills.length ≥ 1`

`purposes`, `interests`, `findMeFor`, `goals`, `currentlyWorkingOn` are all optional.

---

## 6. Side effects

| Trigger | Effect |
|---|---|
| `POST /auth/signup` | Send OTP email |
| `POST /auth/verify-email` | Re-send OTP email (subject to cooldown) |
| `POST /auth/verify-email/confirm` (success) | Mark `emailVerified = true`; create session |
| `POST /me/onboarding/complete` | Mark `onboardingComplete = true`; emit a `user.onboarded` event (for analytics / matching service) |
| `PATCH /me/profile` w/ birthday changes | Optional: schedule a birthday-day notification (FE already shows a celebration popup if it's within ±30 days at onboarding time) |

---

## 7. Error response shape

Suggest a consistent envelope:

```json
{
  "error": {
    "code": "OTP_EXPIRED",
    "message": "The code you entered has expired. Tap Resend to get a new one.",
    "field": null
  }
}
```

`field` is set when the error is tied to a specific input (e.g., `"field": "email"` on duplicate signup). Frontend can map it to inline UI.

Common codes the FE will need to handle:
- `EMAIL_TAKEN`
- `INVALID_CREDENTIALS`
- `OTP_INVALID`
- `OTP_EXPIRED`
- `OTP_TOO_MANY_ATTEMPTS`
- `RESEND_COOLDOWN`
- `VALIDATION_FAILED` (with `field`)
- `ONBOARDING_INCOMPLETE` (returned by `/me/onboarding/complete` if required fields are missing)

---

## 8. Open questions for the backend team

These aren't decided yet — flagging them so they can be answered before implementation locks in:

1. **Session strategy** — JWT in `Authorization: Bearer`, or HTTP-only cookie session? FE doesn't care; either works.
2. **OTP delivery** — what email provider (SES, Resend, Postmark)?
3. **Profile storage** — JSONB column on `users` or separate `profiles` table? Both work; separate table is cleaner if profile data grows.
4. **Skills/interests** — keep as free-text arrays per user, or normalize into a `tags` table with a join? Normalization helps for discovery/matching.
5. **`intent` vs `purposes`** — frontend has both legacy `intent` (single) and the newer `purposes` (ordered array). Recommend keeping only `purposes` server-side and deriving `intent` from `purposes[0]` if other surfaces still need it.
6. **Editing profile** — `/profile` lets users change everything post-onboarding. Same `PATCH /me/profile` endpoint? Yes, probably.
7. **Birthday popup logic** — currently computed client-side from today's date. If the backend wants to own this for a real notification system, we'd need a separate "birthday reminders" service.

---

## 9. Where this lives in the frontend code

For backend folks who want to read what the FE is actually doing:

| Onboarding step | File |
|---|---|
| Signup | `app/auth/signup/page.tsx` |
| OTP verify | `app/auth/verify-email/page.tsx` |
| 1. Profile | `app/auth/onboarding/page.tsx` |
| 2. Personal | `app/auth/onboarding/personal/page.tsx` |
| 3. Role | `app/auth/onboarding/role/page.tsx` |
| 4. Skills | `app/auth/onboarding/skills/page.tsx` |
| 5. Purpose | `app/auth/onboarding/purpose/page.tsx` |
| 6. Interests | `app/auth/onboarding/interests/page.tsx` |
| 7. Find me for | `app/auth/onboarding/find-me-for/page.tsx` |
| 8. Goals | `app/auth/onboarding/goals/page.tsx` |
| 9. Currently working on | `app/auth/onboarding/working-on/page.tsx` |
| Profile read/edit | `app/profile/page.tsx` |

Storage today: a single JSON object at `localStorage("crowhub:profile")`. When the backend is in, this will be replaced by `GET /me` on mount + `PATCH /me/profile` on each save.
