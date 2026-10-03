/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { Search, Calendar, ArrowUpRight, Moon, Sun } from "lucide-react";
import { SocialsSection } from "@/components/socials/SocialButton";
import { ExperienceAccordion } from "@/components/experiences/ExperienceAccordion";
import { GitHubActivity } from "@/components/github/GitHubActivity";

const sections = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "opensource", label: "Open Source" },
  { id: "skills", label: "Skills" },
  { id: "blogs", label: "Blog" },
];

export default function Home() {
  const [active, setActive] = useState("");
  const [time, setTime] = useState("00.00.00");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      setTime(`${h}.${m}.${s}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // keyboard for cmdk
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black relative overflow-x-hidden">
      {/* Grid lines */}
      <div className="absolute top-0 bottom-0 left-[30%] w-0 border-r border-black/30 dark:border-white/[0.15] pointer-events-none hidden md:block" style={{ maskImage: "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)", WebkitMaskImage: "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)" }} />
      <div className="absolute top-0 bottom-0 right-[30%] w-0 border-r border-black/30 dark:border-white/[0.15] pointer-events-none hidden md:block" style={{ maskImage: "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)", WebkitMaskImage: "repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)" }} />
      <div className="absolute left-0 right-0 top-[22vh] h-0 border-b border-black/30 dark:border-white/[0.15] pointer-events-none" style={{ maskImage: "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)", WebkitMaskImage: "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)" }} />
      <div className="absolute left-0 right-0 top-[calc(22vh+112px)] h-0 border-b border-black/30 dark:border-white/[0.15] pointer-events-none" style={{ maskImage: "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)", WebkitMaskImage: "repeating-linear-gradient(to right, black 0, black 1px, transparent 1px, transparent 6px)" }} />
      <div className="absolute w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] pointer-events-none z-10 hidden md:block" style={{ top: "22vh", left: "30%", transform: "translate(-50%, -50%)" }} />
      <div className="absolute w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] pointer-events-none z-10 hidden md:block" style={{ top: "22vh", right: "30%", transform: "translate(50%, -50%)" }} />
      <div className="absolute w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] pointer-events-none z-10 hidden md:block" style={{ top: "calc(22vh + 112px)", left: "30%", transform: "translate(-50%, -50%)" }} />
      <div className="absolute w-[2px] h-[2px] bg-black/50 dark:bg-white/[0.25] pointer-events-none z-10 hidden md:block" style={{ top: "calc(22vh + 112px)", right: "30%", transform: "translate(50%, -50%)" }} />

      {/* Index nav */}
      <div className="fixed inset-0 z-50 pointer-events-none hidden lg:block" style={{ width: "calc(100vw - var(--removed-body-scroll-bar-size, 0px))" }}>
        <nav className="absolute top-[22vh] left-[calc(69%+32px)] pointer-events-auto flex flex-col gap-4 mt-2">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase mb-1">Index</h3>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)} className={`text-[12px] font-medium tracking-[0.05em] transition-all duration-300 ease-out flex items-center gap-3 ${active === s.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"}`}>
              <span className={`h-[1px] transition-all duration-300 ease-out ${active === s.id ? "w-4 bg-zinc-900 dark:bg-zinc-100" : "w-0 bg-transparent"}`} />
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Header banner background — bg-white / bg-black */}
      <div className="absolute left-0 right-0 md:left-[30%] md:right-[30%] top-0 h-[22vh] -z-0 overflow-hidden bg-white dark:bg-black shadow-[0_4px_12px_rgba(2,6,23,0.04)]">
        <img src="/assets/bg-white.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center dark:hidden" />
        <img src="/assets/bg-black.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center hidden dark:block" />
        <div className="absolute inset-0 pointer-events-none z-[5] bg-gradient-to-t from-white/80 to-transparent dark:from-black/40" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-20 bg-gradient-to-r from-white/60 to-transparent dark:from-black/30" />
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-20 bg-gradient-to-l from-white/60 to-transparent dark:from-black/30" />
        <div className="absolute bottom-3 right-2 z-10">
          <div suppressHydrationWarning className="text-[20px] sm:text-[24px] tracking-[0.15em] text-zinc-500 dark:text-zinc-400" style={{ fontFamily: "var(--font-doto), monospace", fontWeight: 700 }}>{time}</div>
        </div>
      </div>

      {/* Top identity bar */}
      <div className="absolute left-0 right-0 md:left-[30%] md:right-[30%] top-[22vh] h-[112px] flex items-center px-4 z-40 bg-white/0">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative p-[3px] rounded-[6px] sm:rounded-[8px] border-[1.5px] border-black/30 dark:border-white/[0.15] shrink-0 bg-white dark:bg-black">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[3px] sm:rounded-[5px] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <img src="/assets/avatar.png" alt="Profile" className="h-full w-full origin-center translate-y-1 scale-[1.1] object-cover opacity-90 grayscale contrast-100 mix-blend-multiply dark:mix-blend-normal" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[20px] sm:text-[24px] font-bold text-zinc-800 dark:text-zinc-100 tracking-tight leading-none mb-0.5 [text-shadow:-1.5px_0_0_rgba(0,200,255,0.3),1.5px_0_0_rgba(255,80,0,0.3)] dark:[text-shadow:-1.5px_0_0_rgba(0,200,255,0.6),1.5px_0_0_rgba(255,80,0,0.6)]">Paras Raju</h1>
              <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400">20</p>
            </div>
          </div>
          <div className="hidden sm:flex items-start justify-end gap-2 sm:gap-3 h-20 sm:h-24 py-1">
            <button onClick={() => setCmdOpen(true)} className="relative group cursor-pointer transition-all duration-300 active:scale-95" aria-label="Search">
              <div className="absolute -inset-[4.5px] border border-black/5 dark:border-white/5 rounded-[9px] pointer-events-none transition-colors group-hover:border-black/10 dark:group-hover:border-white/10" />
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-[#09090b] dark:hover:bg-[#121214] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-[5px] text-[11px] font-medium transition-colors border border-black/5 dark:border-white/5 shadow-sm">
                ⌘ K
              </div>
            </button>
            <button suppressHydrationWarning onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className="relative group cursor-pointer transition-all duration-300 active:scale-95" aria-label="Toggle dark mode">
              <div className="absolute -inset-[4.5px] border border-black/5 dark:border-white/5 rounded-[9px] pointer-events-none transition-colors group-hover:border-black/10 dark:group-hover:border-white/10" />
              <div className="relative flex items-center justify-center w-[32px] h-[28px] bg-zinc-50 hover:bg-zinc-100 dark:bg-[#09090b] dark:hover:bg-[#121214] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-[5px] transition-colors border border-black/5 dark:border-white/5 shadow-sm">
                <span suppressHydrationWarning>{theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content column */}
      <div className="relative pt-[calc(22vh+112px+16px)] md:mx-[30%] px-4 md:px-6 pb-10 max-w-full overflow-hidden">
        {/* Hero */}
        <section className="pt-3 pb-6 border-b border-dashed border-zinc-200 dark:border-zinc-800 -mt-2">
          <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-[560px]">
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Engineer.</span> I love building, and shipping things.
          </p>
          <ul className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-[560px] list-disc pl-5 marker:text-zinc-400">
            <li>AI, open source, and developer tools are where I like to break things.</li>
            <li>I trust shipped code more than polished words.</li>
          </ul>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-3">
            Currently building <a href="https://github.com/parasraju/LeakedAPIs" target="_blank" className="font-semibold text-zinc-900 dark:text-zinc-100 underline decoration-dotted underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300">ApiInstructor</a>, <a href="https://github.com/parasraju/locus" target="_blank" className="font-semibold text-zinc-900 dark:text-zinc-100 underline decoration-dotted underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300">Locus</a>, <a href="https://www.npmjs.com/package/hexlens" target="_blank" className="font-semibold text-zinc-900 dark:text-zinc-100 underline decoration-dotted underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300">Hexlens</a>, and a collection of experimental Python tools.
          </p>
          <div className="flex flex-wrap gap-2 mt-5 max-w-full">
            <a href="https://cal.com/paras-raju/meeting" target="_blank" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[12px] font-medium hover:opacity-90 transition-opacity">
              <Calendar className="w-3.5 h-3.5" /> Book an intro call <span className="text-white/60 dark:text-zinc-500 text-[10px]">cal.com</span>
            </a>
            <a href="mailto:rajuparas766@gmail.com" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[12px] font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Send an email <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <SocialsSection />
        </section>

        {/* Experiences */}
        <section id="experience" className="scroll-mt-24 py-6">
          <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white mb-4">Experiences</h2>
          <ExperienceAccordion />
        </section>

        {/* Projects */}
        <section id="projects" className="scroll-mt-24 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">Projects</h2>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-500 dark:bg-zinc-400" />
              </span>
              Coming soon
              <span className="inline-flex gap-[1px]">
                <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
                <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
                <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
              </span>
            </span>
          </div>
        </section>

        <GitHubActivity />

        {/* Skills */}
        <section id="skills" className="scroll-mt-24 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white mb-3">Skills &amp; Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {[
              ["React","https://cdn.simpleicons.org/react/71717a"],["Node.js","https://cdn.simpleicons.org/nodedotjs/71717a"],["Redis","https://cdn.simpleicons.org/redis/71717a"],["TanStack Query","https://cdn.simpleicons.org/reactquery/71717a"],["Tailwind CSS","https://cdn.simpleicons.org/tailwindcss/71717a"],["shadcn/ui","https://cdn.simpleicons.org/shadcnui/71717a"],["Motion","https://cdn.simpleicons.org/framer/71717a"],["JavaScript","https://cdn.simpleicons.org/javascript/71717a"],["TypeScript","https://cdn.simpleicons.org/typescript/71717a"],["Python","https://cdn.simpleicons.org/python/71717a"],["C / C++","https://cdn.simpleicons.org/cplusplus/71717a"],["SQL","https://cdn.simpleicons.org/mysql/71717a"],["Git","https://cdn.simpleicons.org/git/71717a"],["GitHub","https://cdn.simpleicons.org/github/71717a"],["Figma","https://cdn.simpleicons.org/figma/71717a"],["Docker","https://cdn.simpleicons.org/docker/71717a"],
            ].map(([label, src]) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[12px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <img src={src} alt={label} width={14} height={14} className="h-3.5 w-3.5 opacity-80" /> {label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 px-6 py-1.5 rounded-[6px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[12px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors w-full justify-center">
              <img src="https://cdn.simpleicons.org/linux/71717a" alt="Linux" width={14} height={14} className="h-3.5 w-3.5 opacity-80" /> Linux
            </span>
          </div>
        </section>

        {/* Blogs */}
        <section id="blogs" className="scroll-mt-24 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">Blogs</h2>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-500 dark:bg-zinc-400" />
              </span>
              Coming soon
              <span className="inline-flex gap-[1px]">
                <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
                <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
                <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
              </span>
            </span>
          </div>
        </section>

        {/* Editorial quote — minimal, cinematic, centered — sits well below Blogs */}
        <section className="mt-14 sm:mt-20 py-[72px] sm:py-[84px] bg-white dark:bg-black -mx-4 md:-mx-6 border-y border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="max-w-[520px] mx-auto px-4 md:px-6 text-center">
            <blockquote className="text-[19px] sm:text-[23px] md:text-[25px] italic font-medium leading-[1.35] text-zinc-600 dark:text-zinc-300">
              “Power belongs to those who take it.”
            </blockquote>
            <div className="mt-8 sm:mt-9 flex items-center justify-center gap-3 sm:gap-4">
              <span className="h-px w-7 sm:w-10 bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[11px] tracking-[0.32em] text-zinc-500 uppercase">Tyrell Wellick</span>
              <span className="h-px w-7 sm:w-10 bg-zinc-300 dark:bg-zinc-700" />
            </div>
          </div>
        </section>


      </div>

      {/* Command palette mock */}
      {cmdOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
          <div className="relative w-full max-w-[560px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <Search className="w-4 h-4 text-zinc-400" />
              <input autoFocus placeholder="Search for a command to run..." className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-zinc-400" />
              <span className="text-[11px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">ESC</span>
            </div>
            <div className="p-2 text-[12px] text-zinc-500">
              <div className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer flex items-center justify-between"><span>Go to Projects</span><span className="text-[10px] border px-1 rounded">â†µ</span></div>
              <div className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Toggle theme</div>
              <div className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Copy email</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

