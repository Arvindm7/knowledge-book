import Link from 'next/link';
import { PageLayout } from '@/components/layout';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'About',
  description: `About ${siteConfig.name} - what it is, how it's built, and why it exists.`,
};

const faqs = [
  {
    q: 'What topics does this cover?',
    a: 'Right now the focus is on software engineering: Java, object-oriented design, SOLID principles, UML diagrams, and design patterns. The plan is to keep expanding into system design, algorithms, and anything else worth documenting well.',
  },
  {
    q: 'Who is this for?',
    a: 'Primarily for me - so I stop re-learning the same things twice. But the content is written to be useful for anyone going through similar material, especially developers who prefer concise, example-driven explanations over walls of theory.',
  },
  {
    q: 'How is the content written?',
    a: 'Everything is plain Markdown / MDX files stored in a GitHub repository. Diagrams use Mermaid syntax, math uses KaTeX, and code blocks are syntax-highlighted with Shiki. Writing in plain text means no editor lock-in and easy diffs.',
  },
  {
    q: 'How often is it updated?',
    a: 'Whenever I learn something worth writing down - which is fairly often. A push to the knowledge-base repository triggers an automatic Vercel rebuild, so updates are live within about a minute of being committed.',
  },
  {
    q: 'Can I use this content?',
    a: 'Yes. The content is intended to be helpful. If something here saves you time, great. If you want to reproduce or build on it, credit is appreciated but not required for personal use.',
  },
  {
    q: 'What is the tech stack?',
    a: 'Next.js 15 (App Router), React 19, MDX, Tailwind CSS, Shiki for syntax highlighting, Mermaid for diagrams, KaTeX for math, and Pagefind for offline full-text search. The whole site is statically generated and deployed on Vercel.',
  },
  {
    q: 'Is the source code available?',
    a: 'Yes - the website code and the knowledge-base content are both on GitHub. Links are in the header and at the bottom of this page.',
  },
];

export default function AboutPage() {
  return (
    <PageLayout showSidebar={false}>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Personal intro */}
        <header className="mb-16 border-b border-border/40 pb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            About this site
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A place for things I actually learned.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            I used to keep notes in Notion, bookmarks in Chrome, and half-written code comments
            scattered across projects. None of it was findable when I needed it. So I built this - a
            single, structured, searchable place for everything I&apos;ve learned and want to be
            able to look up again.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            It&apos;s a personal knowledge base first. If it helps you too, that&apos;s a win.
          </p>
        </header>

        {/* FAQ accordion */}
        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Questions &amp; Answers
          </h2>

          <div className="about-faq-list">
            {faqs.map((item, i) => (
              <details key={i} className="about-faq-item group">
                <summary className="about-faq-summary">
                  <span>{item.q}</span>
                  {/* chevron rotates when open via CSS */}
                  <svg
                    className="about-faq-chevron"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    width="14"
                    height="14"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </summary>
                <p className="about-faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer links */}
        <footer className="mt-16 flex flex-wrap items-center gap-4 border-t border-border/40 pt-8">
          <Link
            href="/docs"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Browse the docs &rarr;
          </Link>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </footer>
      </div>
    </PageLayout>
  );
}
