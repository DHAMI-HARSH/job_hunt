import { NextRequest, NextResponse } from "next/server";

type AdzunaJob = {
  id: string | number;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  category?: { label?: string };
};

export async function GET(request: NextRequest) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return NextResponse.json({ error: "Adzuna credentials are not configured." }, { status: 500 });

  const params = request.nextUrl.searchParams;
  const keyword = params.get("keyword")?.trim() || "software engineer";
  const location = params.get("location")?.trim() || process.env.ADZUNA_LOCATION || "India";
  const country = (process.env.ADZUNA_COUNTRY || "in").toLowerCase();
  const experience = params.get("experience")?.trim() || "";
  const experienceTerms: Record<string, string> = { entry: "junior", mid: "mid-level", senior: "senior" };
  const searchKeyword = [keyword, experienceTerms[experience] || ""].filter(Boolean).join(" ");
  const page = Math.max(Number(params.get("page") || 1), 1);
  const searchParams = new URLSearchParams({ app_id: appId, app_key: appKey, results_per_page: "20", what: searchKeyword, sort_by: "date", "content-type": "application/json" });
  searchParams.set("where", location);

  try {
    let response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${searchParams}`, { next: { revalidate: 60 } });
    if (!response.ok) {
      let detail = "Adzuna could not complete that search.";
      try {
        const errorData = (await response.json()) as { display_name?: string; error?: string; message?: string };
        detail = errorData.display_name || errorData.error || errorData.message || detail;
      } catch { /* Keep the friendly fallback when Adzuna returns a non-JSON error. */ }
      return NextResponse.json({ error: `${detail} (HTTP ${response.status})` }, { status: response.status });
    }
    let data = (await response.json()) as { count?: number; results?: AdzunaJob[] };
    if (experience && !(data.results || []).length) {
      const fallbackParams = new URLSearchParams(searchParams);
      fallbackParams.set("what", keyword);
      response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${fallbackParams}`, { next: { revalidate: 60 } });
      if (response.ok) data = (await response.json()) as { count?: number; results?: AdzunaJob[] };
    }
    const jobs = (data.results || []).map((job) => ({ id: job.id, title: job.title || "Untitled role", company: job.company?.display_name || "", location: job.location?.display_name || "", description: job.description || "No description provided.", url: job.redirect_url || "", created: job.created || "", salaryMin: job.salary_min ?? null, salaryMax: job.salary_max ?? null, contractType: job.contract_type || "", category: job.category?.label || "" }));
    return NextResponse.json({ count: data.count || jobs.length, jobs });
  } catch {
    return NextResponse.json({ error: "The job search service is unavailable right now." }, { status: 502 });
  }
}
