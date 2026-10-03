/* eslint-disable @next/next/no-img-element */
"use client";
import type { NormalizedProfile } from "./socialApi";

const PLATFORM_CTA: Record<NormalizedProfile["platform"], string> = {
  github: "GitHub",
  twitter: "X",
  linkedin: "LinkedIn",
  discord: "Discord",
};

const CARD_CLASS =
  "relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-[16px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] shadow-[0_10px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.5)] text-left";
const COVER_CLASS = "relative h-24 w-full shrink-0 overflow-hidden rounded-t-[16px] bg-zinc-900";
const AVATAR_CLASS =
  "absolute left-5 -top-8 h-16 w-16 rounded-full border-[3px] border-white dark:border-[#0f0f0f] bg-white dark:bg-zinc-800 object-cover shadow-md";
const BODY_CLASS = "relative px-6 pb-6 pt-9";
const LOCATION_CLASS = "mt-2 flex items-center gap-1.5 text-[12.5px] text-zinc-500 dark:text-zinc-400";
const CTA_CLASS =
  "mt-4 inline-flex h-12 items-center justify-center gap-1.5 rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[12.5px] font-medium text-zinc-800 dark:text-zinc-200 transition-colors";

function Cover() {
  return (
    <div className={COVER_CLASS}>
      <img src="/assets/bg-black.png" alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function Avatar() {
  return <img src="/assets/avatar.png" alt="" className={AVATAR_CLASS} />;
}

function StatRow({ profile }: { profile: NormalizedProfile }) {
  const stats = profile.stats ?? [];
  return stats.length > 0 ? (
    <>
      <div className="mt-3 h-px bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <p className="truncate text-[14px] font-bold text-zinc-900 dark:text-white">{s.value}</p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>
    </>
  ) : null;
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-200/80 dark:bg-zinc-800/70 ${className}`} />;
}

export function SocialProfileCard({
  profile,
  loading,
  error,
}: {
  profile: NormalizedProfile | null;
  loading: boolean;
  error: string | null;
}) {
  const platform = profile?.platform ?? "github";

  if (loading) {
    return (
      <div className={CARD_CLASS}>
        <Cover />
        <div className={BODY_CLASS}>
          <Avatar />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1.5 h-3 w-20" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-3/4" />
          <div className="mt-3 h-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 grid grid-cols-3 gap-4">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="mt-4 h-12 w-full rounded-[12px]" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={CARD_CLASS}>
        <Cover />
        <div className={BODY_CLASS}>
          <Avatar />
          <h4 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Paras Raju</h4>
          <p className="mt-1 text-[12.5px] text-zinc-500 dark:text-zinc-400">@parasraju</p>
          <p className="mt-4 text-[13px] leading-[1.6] text-zinc-600 dark:text-zinc-300">
            {error ?? "Unable to load profile."}
          </p>
          <a href={profile?.url ?? "https://github.com/parasraju"} target="_blank" rel="noopener noreferrer" className={CTA_CLASS}>
            Open profile <span className="text-zinc-400">↗</span>
          </a>
        </div>
      </div>
    );
  }

  const avatarImgSrc = profile.avatar ?? "/assets/avatar.png";
  const bannerImgSrc = profile.banner ?? "/assets/bg-black.png";
  const location = profile.location;

  return (
    <div className={CARD_CLASS}>
      {/* cover */}
      <div className={COVER_CLASS}>
        <img src={bannerImgSrc} alt="" className="h-full w-full object-cover" />
      </div>

      {/* profile-body */}
      <div className={BODY_CLASS}>
        {/* avatar — anchored to the relative card, half over cover / half into body */}
        <img src={avatarImgSrc} alt={`${profile.name ?? profile.username} avatar`} className={AVATAR_CLASS} />

        {/* identity */}
        <h4 className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
          {profile.name ?? profile.username}
        </h4>
        {profile.headline && (
          <p className="mt-1 truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">{profile.headline}</p>
        )}
        <p className="mt-1 truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">{profile.handle}</p>

        {/* bio */}
        {profile.bio && (
          <p className="mt-4 text-[13px] leading-[1.6] text-zinc-600 dark:text-zinc-300 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* location */}
        {location && (
          <div className={LOCATION_CLASS}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
              <path d="M12 2C8.13 2 5 5.13 5 8.89c0 5.35 6.33 12.17 6.51 12.37a1 1 0 0 0 1.52 0C13.67 21.06 19 14.24 19 8.89 19 5.13 15.87 2 12 2zm0 9.5a2.61 2.61 0 1 1 0-5.22 2.61 2.61 0 0 1 0 5.22z" />
            </svg>
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* stats */}
        <StatRow profile={profile} />

        {/* CTA */}
        <a href={profile.url} target="_blank" rel="noopener noreferrer" className={CTA_CLASS}>
          View on {PLATFORM_CTA[profile.platform]} <span className="text-zinc-400">↗</span>
        </a>
      </div>
    </div>
  );
}