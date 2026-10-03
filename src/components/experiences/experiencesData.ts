export type Experience = {
  id: string;
  title: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  icon?: string; // url
  url: string;
  status: string;
  repo: string;
  prTitle: string;
  prNumber: string;
  bullets: string[];
  tags: string[];
  metrics?: { label: string; value: string }[];
};

export const experiences: Experience[] = [
  {
    id: "hiveory-2026",
    title: "Open Source Contributor",
    organization: "Hiveory",
    role: "Open Source Contributor",
    startDate: "Sep 2026",
    endDate: "Present",
    location: "Remote",
    icon: "/assets/github-icon.png", // fallback to github svg if missing
    url: "https://github.com/raktim-yoddha/hiveory/pull/2",
    status: "",
    repo: "",
    prTitle: "",
    prNumber: "",
    bullets: ["Hiveory: Contributed a reliability fix to Hiveory's orchestration flow, ensuring worker processes are cancelled when a run fails."],
    tags: [],
    metrics: [
      { label: "OPEN SOURCE", value: "CONTRIBUTION" },
      { label: "", value: "2026" },
      { label: "", value: "CURRENT" },
    ],
  },
];
