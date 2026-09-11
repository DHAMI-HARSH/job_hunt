"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Job = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  created: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  contractType?: string;
  category?: string;
};

type ApiResponse = { jobs?: Job[]; count?: number; error?: string };
const initialKeyword = "software engineer";
const favoriteStorageKey = "job-scout-favorites";
const seenStorageKey = "job-scout-seen";
const savedJobsStorageKey = "job-scout-jobs";

function formatDate(value: string) {
  if (!value) return "Recently posted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const format = (value: number) => `£${Math.round(value / 1000)}k`;
  if (min && max) return `${format(min)} – ${format(max)}`;
  return `${format(min || max || 0)}+`;
}

function cleanDescription(description: string) {
  return description.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
}

export default function Home() {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<string | number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);

  const loadJobs = useCallback(async (requestedKeyword: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ keyword: requestedKeyword.trim() || initialKeyword });
      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(data.error || "Could not load jobs.");
      setJobs(data.jobs || []);
      setCount(data.count || data.jobs?.length || 0);
    } catch (requestError) {
      setJobs([]);
      setCount(0);
      setError(requestError instanceof Error ? requestError.message : "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function searchJobs(event?: FormEvent, nextKeyword?: string) {
    event?.preventDefault();
    await loadJobs(nextKeyword ?? keyword);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedKeyword = new URLSearchParams(window.location.search).get("keyword")?.trim() || initialKeyword;
      setKeyword(requestedKeyword);
      void loadJobs(requestedKeyword);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadJobs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFavoriteIds(JSON.parse(window.localStorage.getItem(favoriteStorageKey) || "[]"));
      setSeenIds(JSON.parse(window.localStorage.getItem(seenStorageKey) || "[]"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleFavorite(job: Job) {
    const id = String(job.id);
    const next = favoriteIds.includes(id) ? favoriteIds.filter((item) => item !== id) : [...favoriteIds, id];
    setFavoriteIds(next);
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
    const savedJobs = JSON.parse(window.localStorage.getItem(savedJobsStorageKey) || "{}");
    savedJobs[id] = job;
    window.localStorage.setItem(savedJobsStorageKey, JSON.stringify(savedJobs));
  }

  function toggleSeen(job: Job) {
    const id = String(job.id);
    const next = seenIds.includes(id) ? seenIds.filter((item) => item !== id) : [...seenIds, id];
    setSeenIds(next);
    window.localStorage.setItem(seenStorageKey, JSON.stringify(next));
    const savedJobs = JSON.parse(window.localStorage.getItem(savedJobsStorageKey) || "{}");
    savedJobs[id] = job;
    window.localStorage.setItem(savedJobsStorageKey, JSON.stringify(savedJobs));
  }

  return (
    <main className="site-shell">
      <nav className="topbar">
        <Link className="brand" href="/" aria-label="Job Scout home"><span className="brand-mark">J</span><span>job scout</span></Link>
        <div className="topbar-links"><Link className="dashboard-link" href="/browse">Browse</Link><Link className="dashboard-link" href="/saved">Saved</Link><Link className="dashboard-link" href="/dashboard">Dashboard</Link><div className="topbar-note"><span className="status-dot" /> Live listings from Adzuna</div></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">YOUR NEXT MOVE</div>
        <h1>Find work that<br /><em>moves you forward.</em></h1>
        <p className="hero-copy">Search thousands of fresh roles and get to the application in one click.</p>
        <form className="search-panel" onSubmit={searchJobs}>
          <label className="search-field search-field-keyword"><span className="field-icon">⌕</span><span className="sr-only">Keywords</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Job title, skill, or keyword" /></label>
          <button className="search-button" type="submit" disabled={loading}>{loading ? "Searching…" : "Search jobs"}<span aria-hidden="true">→</span></button>
        </form>
        <div className="popular-searches"><span>Popular:</span><button type="button" onClick={() => { setKeyword("frontend developer"); void searchJobs(undefined, "frontend developer"); }}>Frontend developer</button><button type="button" onClick={() => { setKeyword("product designer"); void searchJobs(undefined, "product designer"); }}>Product designer</button><button type="button" onClick={() => { setKeyword("data analyst"); void searchJobs(undefined, "data analyst"); }}>Data analyst</button></div>
      </section>

      <section className="results-section">
        <div className="results-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>{loading ? "Finding your next role" : `${count.toLocaleString()} roles to explore`}</h2></div>{!loading && jobs.length > 0 && <span className="results-meta">Sorted by newest</span>}</div>
        {error && <div className="notice error-notice"><strong>Couldn’t load live jobs.</strong><span>{error}</span><small>Add ADZUNA_APP_ID and ADZUNA_APP_KEY to <code>jobs-listing/.env.local</code>.</small></div>}
        {loading ? <div className="job-grid">{[1, 2, 3, 4].map((item) => <div className="job-card skeleton-card" key={item}><div className="skeleton skeleton-logo" /><div className="skeleton skeleton-line wide" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>)}</div> : jobs.length > 0 ? <div className="job-grid">{jobs.map((job) => { const salary = formatSalary(job.salaryMin, job.salaryMax); const isExpanded = expandedJobId === job.id; return <article className={`job-card ${isExpanded ? "is-expanded" : ""}`} key={job.id}>
          <div className="job-card-top"><div className="company-logo">{job.company?.charAt(0)?.toUpperCase() || "J"}</div><span className="posted-date">{formatDate(job.created)}</span></div>
          <div className="job-tags"><span>{job.category || "Open role"}</span>{job.contractType && <span>{job.contractType}</span>}</div><h3>{job.title}</h3><p className="company-name">{job.company || "Company not listed"}</p><p className="job-location"><span aria-hidden="true">⌖</span>{job.location || "Location not listed"}</p><p className={`job-description ${isExpanded ? "expanded" : ""}`}>{cleanDescription(job.description)}</p><button className="details-button" type="button" onClick={() => setExpandedJobId(isExpanded ? null : job.id)}>{isExpanded ? "Hide details" : "View details"}<span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span></button>
          <div className="job-footer"><div className="job-markers"><button className={`marker-button ${favoriteIds.includes(String(job.id)) ? "active" : ""}`} type="button" onClick={() => toggleFavorite(job)} aria-label={favoriteIds.includes(String(job.id)) ? "Remove favourite" : "Add favourite"}>♡</button><button className={`marker-button ${seenIds.includes(String(job.id)) ? "active" : ""}`} type="button" onClick={() => toggleSeen(job)}>{seenIds.includes(String(job.id)) ? "Seen" : "Mark seen"}</button></div><div className="job-footer-right">{salary ? <span className="salary">{salary}</span> : <span className="salary muted">Salary not listed</span>}<a className="apply-button" href={job.url} target="_blank" rel="noreferrer">Fast apply <span aria-hidden="true">↗</span></a></div></div>
        </article>; })}</div> : !error && <div className="empty-state"><span className="empty-icon">⌕</span><h3>No roles found</h3><p>Try a broader keyword or search in a different location.</p></div>}
      </section>
      <footer><span>job scout</span><span>Search smarter. Apply faster.</span></footer>
    </main>
  );
}
