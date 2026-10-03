import { NextResponse } from "next/server";

export const revalidate = 3600;
const USERNAME = "parasraju";

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

async function fetchViaGraphQL(token: string): Promise<PR[]> {
  const query = `
    query($q:String!){
      search(query:$q, type: ISSUE, first: 100) {
        nodes {
          ... on PullRequest {
            title
            number
            url
            state
            isDraft
            createdAt
            updatedAt
            mergedAt
            repository { nameWithOwner name owner { login } }
          }
        }
      }
    }
  `;
  const q = `author:${USERNAME} type:pr`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { q } }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = await res.json() as { data?: { search?: { nodes?: unknown[] } } };
  const nodes = (json?.data?.search?.nodes ?? []) as Array<Record<string, unknown>>;
  return nodes.map((n) => {
    const repo = n.repository as { nameWithOwner: string; owner: { login: string } };
    return {
      title: n.title as string,
      repository: repo.nameWithOwner.split("/")[1],
      owner: repo.owner.login,
      number: n.number as number,
      url: n.url as string,
      state: n.state as string,
      merged: !!n.mergedAt,
      createdAt: n.createdAt as string,
      updatedAt: n.updatedAt as string,
      mergedAt: n.mergedAt as string | null,
      draft: !!n.isDraft,
    } as PR;
  });
}

async function fetchViaRest(token?: string): Promise<PR[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  // Search issues for PRs
  const url = `https://api.github.com/search/issues?q=author:${USERNAME}+type:pr&per_page=100`;
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Search ${res.status}`);
  const json = (await res.json()) as { items?: unknown[] };
  const items = (json.items ?? []) as Array<Record<string, unknown>>;

  // Enrich merged status by fetching PR details (limited to first 30 to avoid rate limit)
  const slice = items.slice(0, 60);
  const enriched = await Promise.all(
    slice.map(async (it) => {
      const repoFull = (it.repository_url as string).replace("https://api.github.com/repos/", ""); // owner/repo
      const [owner, repo] = repoFull.split("/");
      const prUrl = (it.pull_request as { url: string }).url; // api url
      try {
        const prRes = await fetch(prUrl, { headers, next: { revalidate: 3600 } });
        if (!prRes.ok) throw new Error("pr fetch fail");
        const pr = (await prRes.json()) as Record<string, unknown>;
        return {
          title: it.title as string,
          repository: repo,
          owner,
          number: it.number as number,
          url: it.html_url as string,
          state: pr.state === "open" ? "OPEN" : pr.merged_at ? "MERGED" : "CLOSED",
          merged: !!pr.merged_at,
          createdAt: pr.created_at as string,
          updatedAt: pr.updated_at as string,
          mergedAt: pr.merged_at as string | null,
          draft: !!pr.draft,
        } as PR;
      } catch {
        // fallback without merged detail
        return {
          title: it.title as string,
          repository: repo,
          owner,
          number: it.number as number,
          url: it.html_url as string,
          state: (it.state as string) === "open" ? "OPEN" : "CLOSED",
          merged: false,
          createdAt: it.created_at as string,
          updatedAt: it.updated_at as string,
          mergedAt: null,
          draft: false,
        } as PR;
      }
    })
  );
  return enriched;
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    let prs: PR[];
    if (token) {
      try {
        prs = await fetchViaGraphQL(token);
      } catch {
        prs = await fetchViaRest(token);
      }
    } else {
      prs = await fetchViaRest();
    }
    // sort by updatedAt desc
    prs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ prs }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
  } catch (e) {
    return NextResponse.json({ prs: [], error: e instanceof Error ? e.message : "failed" }, { status: 200 });
  }
}
