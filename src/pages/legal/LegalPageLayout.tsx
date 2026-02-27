import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LegalSection {
  id: string;
  label: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  summary: string;
  sections: LegalSection[];
  children: ReactNode;
}

interface LegalSectionBlockProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSectionBlock({ id, title, children }: LegalSectionBlockProps) {
  return (
    <section id={id} className="rounded-xl border border-border/70 bg-card p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function LegalPageLayout({ title, lastUpdated, summary, sections, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <nav className="rounded-xl border border-border/70 bg-card p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <article className="mt-6 space-y-4">
          {children}
        </article>

        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground flex flex-wrap gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link to="/medical-disclaimer" className="hover:text-foreground">Medical Disclaimer</Link>
        </div>
      </main>
    </div>
  );
}
