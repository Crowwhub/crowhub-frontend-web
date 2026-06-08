/**
 * Typed client for the backend-crow API.
 *
 * Base URL is read from NEXT_PUBLIC_API_URL (defaults to http://localhost:8080).
 * JWT is persisted to localStorage("crowhub:token") and sent on every
 * authenticated request.
 */

const TOKEN_KEY = "crowhub:token";
export const BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8080";

/* ============================================================ Token */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/* ============================================================ Types */

export type AuthUser = {
  id: string;
  email: string;
  username?: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type Profile = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  birthday: string | null;
  gender: string | null;
  location: string | null;
  personType: string | null;
  role: string | null;
  company: string | null;
  college: string | null;
  aspirantOf: string | null;
  experience: number | null;
  experienceLevel: string | null;
  practiceYears: number | null;
  domain: string | null;
  skills: string[];
  interests: string[];
  exploringInterests: string[];
  findMeFor: string[];
  goals: string[];
  currentlyWorkingOn: string | null;
  promptTagline: string | null;
  madeTillFar: string | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

// Free-text findMeFor value used as the home-page filter.
export type Intent = string;

export type CrowSearchFilters = {
  intent: Intent;
  domain: string;
  personType?: string;
  location?: string;
  interest?: string;
  goal?: string;
  skill?: string;
  limit?: number;
};

export type CrowResult = {
  id: string;
  name: string | null;
  username: string;
  avatar: string | null;
  role: string | null;
  location: string | null;
  domain: string | null;
  personType: string | null;
  aspirantOf: string | null;
  experience: number | null;
  skills: string[];
  interests: string[];
  goals: string[];
  findMeFor: string[];
  currentlyWorkingOn: string | null;
  intent: Intent;
};

export type PublicUser = {
  id: string;
  name: string | null;
  username: string;
  avatar: string | null;
  role: string | null;
  location: string | null;
  domain: string | null;
  personType: string | null;
  aspirantOf: string | null;
  experience: number | null;
  skills: string[];
  interests: string[];
  goals: string[];
  findMeFor: string[];
  currentlyWorkingOn: string | null;
};

export type SwipeFilters = {
  personType?: string;
  location?: string;
  interest?: string;
  goal?: string;
  skill?: string;
};

export type SwipeRequest = {
  swipeId: string;
  intent: string | null;
  domain: string | null;
  filters: SwipeFilters | null;
  createdAt: string;
  user: PublicUser;
};

export type MatchRecord = {
  matchId: string;
  intent: string | null;
  createdAt: string;
  user: PublicUser;
};

export type CreateSwipeInput = {
  swipedId: string;
  direction: "RIGHT" | "LEFT";
  intent?: string;
  domain?: string;
  filters?: SwipeFilters;
};

export type CreateSwipeResult = {
  swipe: { id: string };
  ismatch: boolean;
};

// A single chat message row, as persisted/broadcast by the backend.
// Matches prisma model Chat and the `newMessage` socket payload exactly.
export type ChatMessage = {
  id: string;
  matchId: string;
  senderId: string;
  message: string;
  createdAt: string; // ISO 8601
};

// Per-conversation read marker for the current user (server-persisted).
export type ChatRead = {
  matchId: string;
  lastReadAt: string; // ISO 8601
};

// Home bootstrap config: GET /config
export type ConfigMatch = {
  matchId: string;
  intent: string | null;
  user: PublicUser;
};

export type HomeConfig = {
  streak: { count: number; active: boolean };
  matches: { count: number; top: ConfigMatch[] };
};

export type ProfilePatch = Partial<{
  name: string;
  avatar: string;
  birthday: string; // ISO date "YYYY-MM-DD"
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  location: string;
  personType: string;
  domain: string;
  role: string;
  company: string;
  college: string;
  aspirantOf: string;
  experience: number;
  practiceYears: number;
  skills: string[];
  interests: string[];
  findMeFor: string[];
  goals: string[];
  currentlyWorkingOn: string;
}>;

/* ============================================================ Errors */

export class ApiError extends Error {
  status: number;
  code?: string;
  field?: string;
  payload?: unknown;

  constructor(
    status: number,
    message: string,
    extras?: { code?: string; field?: string; payload?: unknown }
  ) {
    super(message);
    this.status = status;
    this.code = extras?.code;
    this.field = extras?.field;
    this.payload = extras?.payload;
  }
}

/* ============================================================ HTTP */

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  opts: { auth?: boolean } = { auth: true }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  const parsed = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      pickMessage(parsed) || res.statusText || "Request failed";
    throw new ApiError(res.status, message, {
      code: pickCode(parsed),
      field: pickField(parsed),
      payload: parsed,
    });
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function pickMessage(p: unknown): string | undefined {
  if (!p || typeof p !== "object") return undefined;
  const obj = p as Record<string, unknown>;
  if (typeof obj.message === "string") return obj.message;
  if (Array.isArray(obj.message)) return obj.message.join(", ");
  if (obj.error && typeof obj.error === "object") {
    const e = obj.error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return undefined;
}
function pickCode(p: unknown): string | undefined {
  if (!p || typeof p !== "object") return undefined;
  const obj = p as Record<string, unknown>;
  if (typeof obj.code === "string") return obj.code;
  if (obj.error && typeof obj.error === "object") {
    const e = obj.error as Record<string, unknown>;
    if (typeof e.code === "string") return e.code;
  }
  return undefined;
}
function pickField(p: unknown): string | undefined {
  if (!p || typeof p !== "object") return undefined;
  const obj = p as Record<string, unknown>;
  if (typeof obj.field === "string") return obj.field;
  return undefined;
}

/* ============================================================ Endpoints */

export const api = {
  auth: {
    requestOtp(email: string) {
      return request<{ message: string }>(
        "POST",
        "/auth/signup/request-otp",
        { email },
        { auth: false }
      );
    },
    /** Verify OTP, create account, return JWT. */
    signupVerify(input: {
      email: string;
      otp: string;
      password: string;
      username?: string;
    }) {
      return request<AuthResponse>("POST", "/auth/signup", input, {
        auth: false,
      });
    },
    login(input: { email: string; password: string }) {
      return request<AuthResponse>("POST", "/auth/login", input, {
        auth: false,
      });
    },
    logout() {
      setToken(null);
    },
  },

  me: {
    get() {
      return request<Profile>("GET", "/users/me");
    },
    update(patch: ProfilePatch) {
      return request<Profile>("PATCH", "/users/me", patch);
    },
    completeOnboarding() {
      return request<Profile>("POST", "/users/onboarding/complete");
    },
  },

  swipes: {
    feed(filters: CrowSearchFilters) {
      const qs = new URLSearchParams();
      qs.set("intent", filters.intent);
      qs.set("domain", filters.domain);
      if (filters.personType) qs.set("personType", filters.personType);
      if (filters.location) qs.set("location", filters.location);
      if (filters.interest) qs.set("interest", filters.interest);
      if (filters.goal) qs.set("goal", filters.goal);
      if (filters.skill) qs.set("skill", filters.skill);
      if (filters.limit) qs.set("limit", String(filters.limit));
      return request<CrowResult[]>("GET", `/swipes/feed?${qs.toString()}`);
    },
    create(input: CreateSwipeInput) {
      return request<CreateSwipeResult>("POST", "/swipes", input);
    },
    requests() {
      return request<SwipeRequest[]>("GET", "/swipes/requests");
    },
  },

  config: {
    /** Home bootstrap: swipe streak + the user's matches (with total count). */
    get() {
      return request<HomeConfig>("GET", "/config");
    },
  },

  matches: {
    list() {
      return request<MatchRecord[]>("GET", "/matches");
    },
    delete(matchId: string) {
      return request<{ match: string }>("DELETE", `/matches/${matchId}`);
    },
  },

  chat: {
    /** Full message history for a match, oldest first. */
    history(matchId: string) {
      return request<ChatMessage[]>("GET", `/chat/${encodeURIComponent(matchId)}`);
    },
    /** Clear all messages for a match. */
    clear(matchId: string) {
      return request<void>("DELETE", `/chat/message/${encodeURIComponent(matchId)}`);
    },
    /** The current user's read markers across all conversations. */
    reads() {
      return request<ChatRead[]>("GET", "/chat/reads");
    },
    /** Mark a conversation read up to now for the current user. */
    markRead(matchId: string) {
      return request<ChatRead>(
        "POST",
        `/chat/${encodeURIComponent(matchId)}/read`
      );
    },
  },

  profileLikes: {
    listFor(userId: string) {
      return request<string[]>(
        "GET",
        `/profile-likes?userId=${encodeURIComponent(userId)}`,
      );
    },
    toggle(input: { likedUserId: string; itemKey: string; liked: boolean }) {
      return request<{ liked: boolean }>("POST", "/profile-likes", input);
    },
    received() {
      return request<ReceivedLike[]>("GET", "/profile-likes/received");
    },
  },
};

export type ReceivedLike = {
  id: string;
  itemKey: string;
  createdAt: string;
  liker: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
    domain: string | null;
    location: string | null;
  };
};
