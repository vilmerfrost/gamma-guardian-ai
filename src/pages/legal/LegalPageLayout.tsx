import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <article className="prose prose-sm md:prose-base max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
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
