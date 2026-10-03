"use client";
import { useEffect, useState, useMemo } from "react";

type PR = {
  title: string;
  repository: string;
  owner: string;
  number: number;
  url: string;
  state: string;
  merged: boolean;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  draft: boolean;
};

type Tab = "merged" | "open" | "closed";

function statusColor(pr: PR) {
  if (pr.merged || pr.mergedAt) return "bg-[#A855F7] shadow-[0_0_6px_rgba(168,85,247,0.35)]";
  if (pr.state === "OPEN") return "bg-[#22C55E] shadow-[0_0_6px_rgba(34,197,94,0.35)]";
  return "bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.35)]";
}

function ContributionItem({ pr }: { pr: PR }) {
  const repoFull = `${pr.owner}/${pr.repository}`;
  return (
    <div className="py-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0">
      <div className="flex gap-3">
        <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${statusColor(pr)}`} />
        <div className="min-w-0 flex-1">
          <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-[13px] sm:text-[14px] font-semibold text-zinc-900 dark:text-white hover:underline leading-snug line-clamp-2">
            {pr.title}
          </a>
          <a href={`https://github.com/${repoFull}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 mt-1 inline-flex gap-1.5 items-center">
            {repoFull} <span className="text-zinc-400">·</span> #{pr.number} {pr.mergedAt && <span className="text-zinc-400">· Merged {new Date(pr.mergedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
          </a>
        </div>
      </div>
    </div>
  );
}

export function GitHubContributions() {
  const [prs, setPrs] = useState<PR[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("merged");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github/prs");
        const j = await res.json();
        if (!cancelled) setPrs(j.prs ?? []);
      } catch {
        if (!cancelled) setPrs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { merged, open, closed } = useMemo(() => {
    if (!prs) return { merged: [], open: [], closed: [] } as Record<Tab, PR[]>;
    const m = prs.filter((p) => p.merged);
    const o = prs.filter((p) => !p.merged && p.state === "OPEN");
    const c = prs.filter((p) => !p.merged && p.state !== "OPEN");
    return { merged: m, open: o, closed: c };
  }, [prs]);

  const list = tab === "merged" ? merged : tab === "open" ? open : closed;

  return (
    <div className="mt-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">Open Source Contributions</h3>
        <div className="flex rounded-[8px] border border-zinc-200 dark:border-zinc-800 overflow-hidden p-0.5 bg-zinc-100 dark:bg-[#111111] self-start sm:self-auto">
          {(["merged", "open", "closed"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-[11px] font-medium rounded-[6px] capitalize transition-all duration-150 ${tab === t ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              {t === "merged" ? "Merged" : t === "open" ? "Open" : "Closed"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="divide-y divide-dashed divide-zinc-200 dark:divide-zinc-800">
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-4 flex gap-3 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-1/3 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-zinc-500">{tab === "merged" ? "No merged contributions yet" : tab === "open" ? "No open contributions" : "No closed contributions"}</p>
        ) : (
          <div className="divide-y divide-dashed divide-zinc-200 dark:divide-zinc-800">
            {list.map((pr) => (
              <ContributionItem key={`${pr.owner}/${pr.repository}#${pr.number}`} pr={pr} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
