import { NextResponse } from "next/server";

export const revalidate = 3600; // cache 1h

type Week = { contributionDays: { date: string; contributionCount: number; contributionLevel?: string }[] };
const USERNAME = "parasraju";

async function fetchViaGraphQL(token: string) {
  const query = `
    query($login:String!){
      user(login:$login){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error("No calendar");
  return {
    totalContributions: cal.totalContributions as number,
    weeks: cal.weeks as Week[],
  };
}

async function fetchViaPublicApi() {
  // Public contributions API (no auth) — real GitHub data via scraping service
  // jogruber's endpoint mirrors GitHub calendar
  const url = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Public API ${res.status}`);
  const json = await res.json();
  // Normalize: json.contributions = [{date, count, level}], json.total.lastYear
  const contributions: { date: string; count: number; level: number }[] = json.contributions ?? [];
  const total = json.total?.lastYear ?? contributions.reduce((s, c) => s + c.count, 0);

  // Build weeks from flat days (GitHub calendar is 53 weeks)
  // contributions are already sorted ascending
  // Group into weeks starting Sunday
  const weeks: Week[] = [];
  let week: Week = { contributionDays: [] };
  for (const d of contributions) {
    const day = new Date(d.date);
    const dow = day.getUTCDay(); // 0 Sun
    // If week is empty and dow !=0, pad is not needed — just push
    week.contributionDays.push({ date: d.date, contributionCount: d.count, contributionLevel: `LEVEL_${d.level}` });
    if (dow === 6) {
      weeks.push(week);
      week = { contributionDays: [] };
    }
  }
  if (week.contributionDays.length) weeks.push(week);
  return { totalContributions: total, weeks };
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    let data: { totalContributions: number; weeks: Week[] };
    if (token) {
      try {
        data = await fetchViaGraphQL(token);
      } catch {
        data = await fetchViaPublicApi();
      }
    } else {
      data = await fetchViaPublicApi();
    }

    // Normalize to flat days with computed grayscale level if needed via caller
    const headers = {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    };
    return NextResponse.json(data, { headers });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed", totalContributions: 0, weeks: [] }, { status: 200 });
  }
}
