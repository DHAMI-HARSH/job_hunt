import Link from "next/link";

export default function AboutPage() {
  return <main className="site-shell about-page">
    <nav className="topbar"><Link className="brand" href="/" aria-label="Job Scout home"><span className="brand-mark">J</span><span>job scout</span></Link><div className="topbar-links"><Link className="dashboard-link" href="/browse">Browse</Link><Link className="dashboard-link" href="/saved">Saved</Link><Link className="dashboard-link" href="/dashboard">Dashboard</Link></div></nav>
    <section className="about-hero"><p className="eyebrow">A BETTER WAY TO LOOK</p><h1>Less scrolling.<br /><em>More intention.</em></h1><p>Job Scout brings fresh India-based listings, a simple shortlist, and your resume workspace into one calm place.</p></section>
    <section className="about-steps"><article><span>01</span><h2>Search wide</h2><p>Use a role, skill, or phrase to find current listings from Adzuna.</p></article><article><span>02</span><h2>Keep signal</h2><p>Favourite strong matches and mark roles seen so your search stays clear.</p></article><article><span>03</span><h2>Apply ready</h2><p>Keep your resume in Drive and jump to the original listing when it feels right.</p></article></section>
    <div className="about-cta"><Link className="apply-button" href="/">Start searching</Link><Link className="text-link" href="/dashboard">Open your dashboard →</Link></div>
    <footer><span>job scout</span><span>Search smarter. Apply faster.</span></footer>
  </main>;
}
