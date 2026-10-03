// Real-data social adapters — no fake stats, no scraping.

export type NormalizedProfile = {
  platform: "github" | "twitter" | "linkedin" | "discord";
  avatar: string | null;
  banner: string | null;
  name: string | null;
  username: string; // handle without @
  handle: string; // @username
  bio: string | null;
  location: string | null;
  headline: string | null; // linkedin headline / role
  verified?: boolean;
  url: string;
  stats?: { label: string; value: string | number }[];
  raw?: unknown;
};

// --- config — replace with your actual usernames ---
// Homepage banner/logo used for every hover card — keeps UI consistent
const HOMEPAGE_BANNER = "/assets/bg-black.png";
const HOMEPAGE_AVATAR = "/assets/avatar.png";

export const SOCIAL_CONFIG = {
  github: { username: "parasraju", url: "https://github.com/parasraju", banner: HOMEPAGE_BANNER as string | null, avatarFallback: HOMEPAGE_AVATAR as string | null },
  twitter: { username: "parashawtyy", url: "https://x.com/parashawtyy", name: "Paras Raju", banner: HOMEPAGE_BANNER as string | null, avatarFallback: HOMEPAGE_AVATAR as string | null },
  linkedin: { username: "paras-raju-96427933a", url: "https://www.linkedin.com/in/paras-raju-96427933a/", name: "Paras Raju", banner: HOMEPAGE_BANNER as string | null, avatarFallback: HOMEPAGE_AVATAR as string | null },
  discord: { username: "parasraju", url: "https://discord.com", name: "Paras Raju", banner: HOMEPAGE_BANNER as string | null, avatarFallback: HOMEPAGE_AVATAR as string | null },
} as const;

// simple in-memory cache + inflight dedup
const cache = new Map<string, { data: NormalizedProfile; at: number }>();
const inflight = new Map<string, Promise<NormalizedProfile>>();
const TTL = 5 * 60 * 1000; // 5 min

function getCached(key: string): NormalizedProfile | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

// --- GitHub — REAL API ---
async function fetchGitHub(username: string): Promise<NormalizedProfile> {
  const key = `github:${username}`;
  const cached = getCached(key);
  if (cached) return cached;
  if (inflight.has(key)) return inflight.get(key)!;

  const p = (async () => {
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const j = await res.json();
      const profile: NormalizedProfile = {
        platform: "github",
        avatar: j.avatar_url ?? null,
        banner: SOCIAL_CONFIG.github.banner ?? null, // GitHub API has no banner — use custom config or null (shows gradient)
        name: j.name ?? j.login ?? null,
        username: j.login ?? username,
        handle: `@${j.login ?? username}`,
        bio: j.bio ?? null,
        location: j.location ?? null,
        headline: j.company ? String(j.company) : null,
        url: j.html_url ?? `https://github.com/${username}`,
        stats: [
          { label: "Repositories", value: j.public_repos ?? 0 },
          { label: "Followers", value: typeof j.followers === "number" ? j.followers.toLocaleString() : j.followers ?? 0 },
          { label: "Following", value: typeof j.following === "number" ? j.following.toLocaleString() : j.following ?? 0 },
        ].filter((s) => s.value !== null && s.value !== undefined),
        raw: j,
      };
      cache.set(key, { data: profile, at: Date.now() });
      return profile;
    } catch {
      // graceful fallback — no fake counts, only known static fields
      const fallback: NormalizedProfile = {
        platform: "github",
        avatar: null,
        banner: SOCIAL_CONFIG.github.banner ?? null,
        name: null,
        username,
        handle: `@${username}`,
        bio: null,
        location: null,
        headline: null,
        url: `https://github.com/${username}`,
        // omit stats when unavailable — don't invent
        stats: undefined,
      };
      return fallback;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

// --- Twitter / X — official API only if configured ---
// No scraping. If not configured, return only legitimately known fields.
async function fetchTwitter(username: string): Promise<NormalizedProfile> {
  const key = `twitter:${username}`;
  const cached = getCached(key);
  if (cached) return cached;
  // No official X creds in this template — return graceful minimal profile
  // If you add X OAuth bearer token, replace this with a fetch to api.twitter.com/2/users/by/username/:username
  const profile: NormalizedProfile = {
    platform: "twitter",
    avatar: null,
    banner: SOCIAL_CONFIG.twitter.banner ?? null,
    name: SOCIAL_CONFIG.twitter.name,
    username,
    handle: `@${username}`,
    bio: null,
    location: null,
    headline: null,
    verified: undefined,
    url: `https://x.com/${username}`,
    stats: undefined, // don't fabricate follower counts
  };
  cache.set(key, { data: profile, at: Date.now() });
  return profile;
}

async function fetchLinkedIn(): Promise<NormalizedProfile> {
  const key = `linkedin:${SOCIAL_CONFIG.linkedin.username}`;
  const cached = getCached(key);
  if (cached) return cached;
  const profile: NormalizedProfile = {
    platform: "linkedin",
    avatar: null,
    banner: SOCIAL_CONFIG.linkedin.banner ?? null,
    name: SOCIAL_CONFIG.linkedin.name,
    username: SOCIAL_CONFIG.linkedin.username,
    handle: SOCIAL_CONFIG.linkedin.name,
    bio: null,
    location: null,
    headline: null,
    url: SOCIAL_CONFIG.linkedin.url,
    stats: undefined,
  };
  cache.set(key, { data: profile, at: Date.now() });
  return profile;
}

async function fetchDiscord(): Promise<NormalizedProfile> {
  const key = `discord:${SOCIAL_CONFIG.discord.username}`;
  const cached = getCached(key);
  if (cached) return cached;
  const profile: NormalizedProfile = {
    platform: "discord",
    avatar: null,
    banner: SOCIAL_CONFIG.discord.banner ?? null,
    name: SOCIAL_CONFIG.discord.name,
    username: SOCIAL_CONFIG.discord.username,
    handle: `@${SOCIAL_CONFIG.discord.username}`,
    bio: null,
    location: null,
    headline: null,
    url: SOCIAL_CONFIG.discord.url,
    stats: undefined,
  };
  cache.set(key, { data: profile, at: Date.now() });
  return profile;
}

export async function fetchProfile(platform: NormalizedProfile["platform"]): Promise<NormalizedProfile> {
  switch (platform) {
    case "github":
      return fetchGitHub(SOCIAL_CONFIG.github.username);
    case "twitter":
      return fetchTwitter(SOCIAL_CONFIG.twitter.username);
    case "linkedin":
      return fetchLinkedIn();
    case "discord":
      return fetchDiscord();
  }
}
