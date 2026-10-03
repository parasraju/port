"use client";
import { useEffect, useState, useMemo } from "react";
import { GitHubContributions } from "./GitHubContributions";

type Day = { date: string; count: number };
type Week = { contributionDays: { date: string; contributionCount: number }[] };
type ApiData = { totalContributions: number; weeks: Week[] };

function levelFor(count: number, max: number) {
  if (count === 0) return 0;
  if (max === 0) return 0;
  const r = count / max;
  if (r <= 0.25) return 1;
  if (r <= 0.5) return 2;
  if (r <= 0.75) return 3;
  return 4;
}

const grayscale: Record<number, string> = {
  0: "bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/50",
  1: "bg-zinc-300 dark:bg-zinc-800",
  2: "bg-zinc-400 dark:bg-zinc-600",
  3: "bg-zinc-700 dark:bg-zinc-400",
  4: "bg-zinc-900 dark:bg-zinc-200",
};

function formatTooltip(count: number, dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const fmt = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (count === 0) return `No contributions on ${fmt}`;
  return `${count} contribution${count === 1 ? "" : "s"} on ${fmt}`;
}

function ContributionDay({ day, level }: { day: Day; level: number }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className={`w-full aspect-square rounded-[2px] ${grayscale[level]} cursor-default`}
        aria-label={formatTooltip(day.count, day.date)}
      />
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
          <div className="whitespace-nowrap rounded-[6px] border border-zinc-700 bg-[#1a1a1a] px-2 py-1 text-[11px] leading-none text-zinc-200 shadow-lg">
            {formatTooltip(day.count, day.date)}
          </div>
          <div className="mx-auto h-1.5 w-1.5 rotate-45 bg-[#1a1a1a] border-r border-b border-zinc-700 -mt-1" />
        </div>
      )}
    </div>
  );
}

export function GitHubActivity() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github/contributions");
        if (!res.ok) throw new Error(String(res.status));
        const j = await res.json();
        if (j.error && (!j.weeks || j.weeks.length === 0)) throw new Error(j.error);
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter to Jan 2026 -> current (today) for display
  const { weeks, totalFiltered, max, monthLabels } = useMemo(() => {
    if (!data) return { weeks: [] as Week[], totalFiltered: 0, max: 0, monthLabels: [] as { month: string; index: number }[] };
    const start = new Date("2026-01-01T00:00:00");
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filteredWeeks: Week[] = [];
    let maxC = 0;
    let total = 0;
    for (const w of data.weeks) {
      const filteredDays = w.contributionDays.filter((d) => {
        const dt = new Date(d.date + "T00:00:00");
        return dt >= start && dt <= end;
      });
      if (filteredDays.length === 0) continue;
      for (const d of filteredDays) if (d.contributionCount > maxC) maxC = d.contributionCount;
      for (const d of filteredDays) total += d.contributionCount;
      filteredWeeks.push({ contributionDays: filteredDays });
    }

    // month labels — every month Jan..current, one label per month at its first week
    const labels: { month: string; index: number }[] = [];
    let lastMonth = "";
    filteredWeeks.forEach((w, wi) => {
      // find first day of its month
      const first = w.contributionDays.find((d) => {
        const m = new Date(d.date + "T00:00:00").getMonth();
        const cur = new Date(w.contributionDays[0].date + "T00:00:00").getMonth();
        return m === cur;
      }) ?? w.contributionDays[0];
      if (!first) return;
      const mStr = new Date(first.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" });
      if (mStr !== lastMonth) {
        labels.push({ month: mStr, index: wi });
        lastMonth = mStr;
      }
    });
    return { weeks: filteredWeeks, totalFiltered: total, max: maxC, monthLabels: labels };
  }, [data]);

  if (loading) {
    return (
      <section id="opensource" className="scroll-mt-24 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">GitHub Activity</h2>
          <span className="text-[12px] text-zinc-500">Loading…</span>
        </div>
        <div className="w-full animate-pulse">
          <div className="flex gap-[3px] mb-2 w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-3 flex-1 bg-zinc-800/50 rounded" />
            ))}
          </div>
          <div className="flex gap-[2px] sm:gap-[3px] w-full">
            {Array.from({ length: 53 }).map((_, wi) => (
              <div key={wi} className="flex-1 flex flex-col gap-[2px] sm:gap-[3px]">
                {Array.from({ length: 7 }).map((__, di) => (
                  <div key={di} className="w-full aspect-square rounded-[2px] bg-zinc-900" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !data || weeks.length === 0) {
    return (
      <section id="opensource" className="scroll-mt-24 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">GitHub Activity</h2>
          <span className="text-[12px] text-zinc-500">GitHub activity unavailable</span>
        </div>
        <p className="text-[12px] text-zinc-500">Unable to load contributions. Add GITHUB_TOKEN to env for official GraphQL.</p>
      </section>
    );
  }

  return (
    <section id="opensource" className="scroll-mt-24 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">GitHub Activity</h2>
        <span className="text-[12px] sm:text-[13px] text-zinc-500 dark:text-zinc-400">
          {totalFiltered.toLocaleString()} GitHub activities in 2026
        </span>
      </div>

      <div className="w-full max-w-full overflow-hidden">
        {/* Month labels — same column geometry as grid, labels not clipped, aligned to week start */}
        <div className="flex gap-[2px] sm:gap-[3px] w-full mb-2 h-4 overflow-visible">
          {weeks.map((_, wi) => {
            const label = monthLabels.find((m) => m.index === wi);
            return (
              <div key={wi} className="flex-1 relative overflow-visible">
                {label && <span className="absolute left-0 top-0 text-[12px] sm:text-[13px] text-zinc-600 dark:text-zinc-500 whitespace-nowrap leading-none font-normal">{label.month}</span>}
              </div>
            );
          })}
        </div>

        {/* Grid — 53 weeks, 7 days, responsive fit, NO scroll */}
        <div className="flex gap-[2px] sm:gap-[3px] w-full">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex-1 flex flex-col gap-[2px] sm:gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const d = w.contributionDays[di];
                if (!d) return <div key={di} className="w-full aspect-square" />;
                const lvl = levelFor(d.contributionCount, max);
                return <ContributionDay key={d.date} day={{ date: d.date, count: d.contributionCount }} level={lvl} />;
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-zinc-500">Less active</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-[2px] sm:gap-[3px]">
              {[0, 1, 2, 3, 4].map((l) => (
                <div key={l} className={`w-3 h-3 sm:w-[12px] sm:h-[12px] rounded-[2px] ${grayscale[l]}`} />
              ))}
            </div>
            <span className="text-[11px] text-zinc-500">More active</span>
          </div>
        </div>
      </div>
      <GitHubContributions />
    </section>
  );
}
