"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SavedJob = { id: string | number; title: string; company: string; location: string; url: string };
type Mode = "favorites" | "seen";
const jobsKey = "job-scout-jobs";
const keyByMode: Record<Mode, string> = { favorites: "job-scout-favorites", seen: "job-scout-seen" };

export default function JobLibrary({ mode }: { mode: Mode }) {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const isFavorites = mode === "favorites";

  const loadJobs = useCallback(() => {
    const saved = JSON.parse(window.localStorage.getItem(jobsKey) || "{}");
    const ids = JSON.parse(window.localStorage.getItem(keyByMode[mode]) || "[]") as string[];
    setJobs((Object.values(saved) as SavedJob[]).filter((job) => ids.includes(String(job.id))));
  }, [mode]);

  function remove(job: SavedJob) {
    const ids = JSON.parse(window.localStorage.getItem(keyByMode[mode]) || "[]") as string[];
    window.localStorage.setItem(keyByMode[mode], JSON.stringify(ids.filter((id) => id !== String(job.id))));
    loadJobs();
  }

  useEffect(() => {
    const timer = window.setTimeout(loadJobs, 0);
    return () => window.clearTimeout(timer);
  }, [loadJobs]);

  return <main className="site-shell library-page">
    <nav className="topbar"><Link className="brand" href="/" aria-label="Job Scout home"><span className="brand-mark">J</span><span>job scout</span></Link><div className="topbar-links"><Link className="dashboard-link" href="/browse">Browse</Link><Link className={`dashboard-link ${isFavorites ? "active" : ""}`} href="/saved">Saved</Link><Link className={`dashboard-link ${!isFavorites ? "active" : ""}`} href="/seen">Seen</Link><Link className="dashboard-link" href="/dashboard">Dashboard</Link></div></nav>
    <section className="library-hero"><p className="eyebrow">YOUR COLLECTION</p><h1>{isFavorites ? <>Roles worth<br /><em>a second look.</em></> : <>Your search<br /><em>trail.</em></>}</h1><p>{isFavorites ? "Keep the opportunities that feel like a genuine fit in one place." : "A quiet record of the roles you have already reviewed."}</p></section>
    <section className="library-content"><div className="library-toolbar"><h2>{isFavorites ? "Favourite jobs" : "Seen jobs"}</h2><span>{jobs.length} saved</span></div>{jobs.length === 0 ? <div className="library-empty"><p className="eyebrow">NOTHING HERE YET</p><h3>{isFavorites ? "Start building your shortlist." : "Your browsing history is clear."}</h3><p>{isFavorites ? "Tap the heart on any live listing to bring it here." : "Mark a listing as seen and it will stay available here."}</p><Link className="apply-button" href="/">Browse live jobs</Link></div> : <div className="library-list">{jobs.map((job) => <article className="library-job" key={job.id}><div className="company-logo">{job.company?.charAt(0)?.toUpperCase() || "J"}</div><div className="library-job-copy"><h3>{job.title}</h3><p>{job.company || "Company not listed"} · {job.location || "India"}</p></div><div className="library-job-actions"><button className="marker-button" type="button" onClick={() => remove(job)}>Remove</button><a className="apply-button" href={job.url} target="_blank" rel="noreferrer">Open ↗</a></div></article>)}</div>}</section>
    <footer><span>job scout</span><span>Search smarter. Apply faster.</span></footer>
  </main>;
}
