"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type SavedJob = { id: string | number; title: string; company: string; location: string; url: string };
type DriveFile = { id: string; name: string; mimeType: string; modifiedTime?: string; webViewLink?: string };
const favoritesKey = "job-scout-favorites";
const seenKey = "job-scout-seen";
const jobsKey = "job-scout-jobs";

export default function Dashboard() {
  const [favorites, setFavorites] = useState<SavedJob[]>([]);
  const [seen, setSeen] = useState<SavedJob[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [driveMessage, setDriveMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  function loadSavedJobs() {
    const saved = JSON.parse(window.localStorage.getItem(jobsKey) || "{}");
    const favoriteIds = JSON.parse(window.localStorage.getItem(favoritesKey) || "[]") as string[];
    const seenIds = JSON.parse(window.localStorage.getItem(seenKey) || "[]") as string[];
    const allJobs = Object.values(saved) as SavedJob[];
    setFavorites(allJobs.filter((job) => favoriteIds.includes(String(job.id))));
    setSeen(allJobs.filter((job) => seenIds.includes(String(job.id))));
  }

  async function loadDriveFiles() {
    const response = await fetch("/api/drive/resume");
    const data = (await response.json()) as { files?: DriveFile[]; error?: string };
    if (!response.ok) { setDriveMessage(data.error || "Connect Google Drive to see your files."); return; }
    setDriveMessage("");
    setFiles(data.files || []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { loadSavedJobs(); void loadDriveFiles(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function uploadResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("resume") as HTMLInputElement;
    if (!fileInput.files?.[0]) return;
    setUploading(true);
    setDriveMessage("");
    const body = new FormData();
    body.append("resume", fileInput.files[0]);
    const response = await fetch("/api/drive/resume", { method: "POST", body });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) setDriveMessage(data.error || "The resume could not be uploaded.");
    else { setDriveMessage("Resume saved to Google Drive."); form.reset(); await loadDriveFiles(); }
    setUploading(false);
  }

  return <main className="site-shell dashboard-shell">
    <nav className="topbar"><Link className="brand" href="/" aria-label="Job Scout home"><span className="brand-mark">J</span><span>job scout</span></Link><div className="topbar-links"><Link className="dashboard-link active" href="/dashboard">Dashboard</Link><Link className="dashboard-link" href="/">Search jobs</Link></div></nav>
    <section className="dashboard-hero"><p className="eyebrow">YOUR WORKSPACE</p><h1>Keep your search<br /><em>moving forward.</em></h1><p>Save the roles worth revisiting and keep your latest resume close at hand.</p></section>
    <section className="dashboard-grid">
      <article className="dashboard-panel resume-panel"><div className="panel-heading"><div><p className="eyebrow">RESUME VAULT</p><h2>Google Drive</h2></div><span className="panel-icon">↗</span></div><p className="panel-copy">Connect Drive to upload and fetch the resume you use for applications.</p>{driveMessage && <div className="dashboard-message">{driveMessage}</div>}<div className="drive-actions"><a className="apply-button" href="/api/drive/auth">Connect Google Drive</a><form onSubmit={uploadResume}><label className="file-picker"><span>{uploading ? "Uploading…" : "Choose PDF or DOCX"}</span><input name="resume" type="file" accept=".pdf,.doc,.docx" disabled={uploading} /></label><button className="secondary-button" type="submit" disabled={uploading}>{uploading ? "Saving…" : "Save to Drive"}</button></form></div><div className="drive-files"><div className="subheading"><span>Recent resume files</span><button type="button" onClick={() => void loadDriveFiles()}>Refresh</button></div>{files.length === 0 ? <p className="muted-copy">No resume files loaded yet.</p> : files.map((file) => <div className="drive-file" key={file.id}><span className="file-badge">{file.mimeType.includes("pdf") ? "PDF" : "DOC"}</span><span>{file.name}</span>{file.webViewLink && <a href={file.webViewLink} target="_blank" rel="noreferrer">Open</a>}</div>)}</div></article>
      <article className="dashboard-panel stats-panel"><p className="eyebrow">APPLICATION BOARD</p><h2>Your saved signals</h2><div className="stats-row"><div><strong>{favorites.length}</strong><span>Favourites</span></div><div><strong>{seen.length}</strong><span>Seen jobs</span></div></div><p className="panel-copy">Use the small heart and seen controls on job cards to build your shortlist.</p><Link className="text-link" href="/">Browse live jobs →</Link></article>
      <article className="dashboard-panel saved-panel"><div className="panel-heading"><div><p className="eyebrow">SHORTLIST</p><h2>Favourite jobs</h2></div><span className="count-pill">{favorites.length}</span></div>{favorites.length === 0 ? <p className="muted-copy">Favourite roles from the search page and they will appear here.</p> : <div className="saved-list">{favorites.map((job) => <div className="saved-job" key={job.id}><div><h3>{job.title}</h3><p>{job.company} · {job.location}</p></div><a href={job.url} target="_blank" rel="noreferrer">Open ↗</a></div>)}</div>}</article>
      <article className="dashboard-panel saved-panel"><div className="panel-heading"><div><p className="eyebrow">HISTORY</p><h2>Seen jobs</h2></div><span className="count-pill">{seen.length}</span></div>{seen.length === 0 ? <p className="muted-copy">Mark jobs as seen to keep a simple browsing history.</p> : <div className="saved-list">{seen.map((job) => <div className="saved-job" key={job.id}><div><h3>{job.title}</h3><p>{job.company} · {job.location}</p></div><a href={job.url} target="_blank" rel="noreferrer">Open ↗</a></div>)}</div>}</article>
    </section>
    <footer><span>job scout</span><span>Search smarter. Apply faster.</span></footer>
  </main>;
}
