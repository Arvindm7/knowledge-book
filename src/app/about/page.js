import Link from 'next/link';
import { PageLayout } from '@/components/layout';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'About',
  description: `About ${siteConfig.name} — a personal knowledge documentation platform.`,
};

export default function AboutPage() {
  return (
    <PageLayout showSidebar={false}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            About {siteConfig.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A personal documentation platform for organizing, structuring, and sharing knowledge.
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground">What is this?</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {siteConfig.name} is a curated collection of notes, guides, and references built as a
              personal knowledge base. All content is written in Markdown and stored in a dedicated
              GitHub repository, then automatically rendered into this website.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground">How it works</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Write in Markdown',
                  description:
                    'Content lives in a separate knowledge-base repository as plain Markdown and MDX files.',
                  icon: '📝',
                },
                {
                  title: 'Auto-sync',
                  description:
                    'Pushing to the knowledge-base triggers an automatic rebuild and deployment.',
                  icon: '🔄',
                },
                {
                  title: 'Static & Fast',
                  description:
                    'The entire site is statically generated at build time for maximum performance.',
                  icon: '⚡',
                },
                {
                  title: 'Full-text Search',
                  description: 'Search across all content with Pagefind — no backend required.',
                  icon: '🔍',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground">Tech Stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                'Next.js 16',
                'React 19',
                'Tailwind CSS',
                'MDX',
                'Shiki',
                'Pagefind',
                'Framer Motion',
                'KaTeX',
                'Vercel',
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Source Code</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              This project is open source. You can find the code and the content repository on
              GitHub.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/docs"
                className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                Browse Docs
              </Link>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent"
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub
              </a>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
