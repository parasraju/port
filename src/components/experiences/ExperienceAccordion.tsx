"use client";
import { useState } from "react";
import { experiences, type Experience } from "./experiencesData";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ease-out shrink-0 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ExperienceRow({ exp, isOpen, onToggle }: { exp: Experience; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-b-0">
      {/* Collapsed header — clickable */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start gap-3 sm:gap-4 py-4 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400/50"
      >
        {/* Icon */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-zinc-900 dark:text-white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-zinc-900 dark:text-white leading-tight tracking-tight">{exp.title}</h3>
          <p className="text-[12px] sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {exp.organization} / {exp.role}
          </p>
          {/* mobile date */}
          <div className="sm:hidden mt-1.5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">{exp.startDate} – {exp.endDate} · {exp.location}</p>
          </div>
        </div>

        {/* Date + chevron — desktop only */}
        <div className="hidden sm:flex items-start gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[12px] sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-tight whitespace-nowrap">
              {exp.startDate} – {exp.endDate}
            </p>
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">{exp.location}</p>
          </div>
          <span className="mt-1.5">
            <Chevron open={isOpen} />
          </span>
        </div>
        <span className="sm:hidden mt-1.5 shrink-0">
          <Chevron open={isOpen} />
        </span>
      </button>

      {/* Expanded content */}
      <div
        className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} motion-reduce:transition-none`}
      >
        <div className="overflow-hidden">
          <div className={`pl-0 sm:pl-[56px] pb-6 sm:pb-7 transition-all duration-300 ease-out ${isOpen ? "translate-y-0" : "-translate-y-1"} motion-reduce:translate-y-0`}>
            {/* Metrics row — subtle, no fabricated numbers */}
            {exp.metrics && (
              <div className="flex gap-6 sm:gap-8 mb-5">
                <div className="text-[10px] leading-tight">
                  <p className="font-semibold tracking-[0.12em] text-zinc-400 dark:text-zinc-500">OPEN SOURCE</p>
                  <p className="font-semibold tracking-[0.12em] text-zinc-900 dark:text-white">CONTRIBUTION</p>
                </div>
                <div className="text-[10px] leading-tight">
                  <p className="font-semibold tracking-[0.12em] text-zinc-900 dark:text-white">2026</p>
                  <p className="text-zinc-400 dark:text-zinc-500 tracking-[0.12em]">CURRENT</p>
                </div>
              </div>
            )}

            {/* Bullets */}
            <ul className="space-y-2.5 text-[13px] leading-[1.65] text-zinc-600 dark:text-zinc-300 list-disc pl-5 marker:text-zinc-400 dark:marker:text-zinc-600">
              {exp.bullets.map((b, i) => {
                const idx = b.indexOf(":");
                if (idx > 0) {
                  return (
                    <li key={i}>
                      <span className="font-semibold text-zinc-900 dark:text-white">{b.slice(0, idx)}</span>
                      {b.slice(idx)}
                    </li>
                  );
                }
                return <li key={i}>{b}</li>;
              })}
            </ul>

            {/* PR meta — hidden when empty */}
            {exp.prTitle && (
              <div className="mt-5 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3.5 py-3">
                <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{exp.prTitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-600 text-white font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> {exp.status}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">{exp.repo}</span>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{exp.prNumber}</span>
                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-zinc-900 dark:text-white underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300">
                    View PR ↗
                  </a>
                </div>
              </div>
            )}

            {/* Tags — hidden when empty */}
            {exp.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {exp.tags.map((t) => (
                  <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperienceAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="w-full">
      {experiences.map((exp) => (
        <ExperienceRow key={exp.id} exp={exp} isOpen={openId === exp.id} onToggle={() => setOpenId((v) => (v === exp.id ? null : exp.id))} />
      ))}
    </div>
  );
}
