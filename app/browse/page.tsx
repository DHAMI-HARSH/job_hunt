import Link from "next/link";

const categories = [
  { name: "Technology", note: "Build the tools people use every day.", queries: ["software engineer", "frontend developer", "data analyst"] },
  { name: "Design & product", note: "Shape useful, thoughtful experiences.", queries: ["product designer", "ux designer", "product manager"] },
  { name: "Business & operations", note: "Make ambitious teams work better.", queries: ["business analyst", "project manager", "operations manager"] },
  { name: "Marketing & content", note: "Tell stories that move people.", queries: ["marketing manager", "content writer", "social media manager"] },
  { name: "Finance & analysis", note: "Turn information into momentum.", queries: ["financial analyst", "accountant", "risk analyst"] },
  { name: "Early career", note: "Find a first step with room to grow.", queries: ["graduate jobs", "internship", "junior developer"] },
];

export default function BrowsePage() {
  return <main className="site-shell browse-page">
    <nav className="topbar"><Link className="brand" href="/" aria-label="Job Scout home"><span className="brand-mark">J</span><span>job scout</span></Link><div className="topbar-links"><Link className="dashboard-link active" href="/browse">Browse</Link><Link className="dashboard-link" href="/saved">Saved</Link><Link className="dashboard-link" href="/seen">Seen</Link><Link className="dashboard-link" href="/dashboard">Dashboard</Link></div></nav>
    <section className="browse-hero"><p className="eyebrow">EXPLORE THE MARKET</p><h1>Find your<br /><em>direction.</em></h1><p>Start with a lane, then let the listings help you sharpen the search.</p></section>
    <section className="category-grid">{categories.map((category) => <article className="category-card" key={category.name}><span className="category-number">0{categories.indexOf(category) + 1}</span><h2>{category.name}</h2><p>{category.note}</p><div className="category-links">{category.queries.map((query) => <Link href={`/?keyword=${encodeURIComponent(query)}`} key={query}>{query}<span>→</span></Link>)}</div></article>)}</section>
    <footer><span>job scout</span><span>Search smarter. Apply faster.</span></footer>
  </main>;
}
