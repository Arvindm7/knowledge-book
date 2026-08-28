import Link from 'next/link';
import { PageLayout } from '@/components/layout';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'About',
  description: `About ${siteConfig.name} â€” a personal knowledge documentation platform built with Next.js, MDX, and a passion for clear technical writing.`,
};

/* â”€â”€â”€ inline style helpers (avoids needing new CSS classes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const card =
  'rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-0.5';

const badge =
  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground';

export default function AboutPage() {
  const stats = [
    { value: '100+', label: 'Articles & Guides', icon: 'ðŸ“„' },
    { value: 'MDX', label: 'Powered Content', icon: 'âœï¸' },
    { value: '< 1s', label: 'Page Load Time', icon: 'âš¡' },
    { value: 'âˆž', label: 'Things to Learn', icon: 'ðŸ§ ' },
  ];

  const features = [
    {
      icon: 'ðŸ—‚ï¸',
      title: 'Structured Knowledge',
      desc: 'Every topic is organized into clear chapters and sections â€” no more hunting through scattered notes.',
    },
    {
      icon: 'ðŸŽ¨',
      title: 'Beautiful Reading Experience',
      desc: 'Syntax-highlighted code, KaTeX math, Mermaid diagrams, and dark-mode support out of the box.',
    },
    {
      icon: 'ðŸ”',
      title: 'Instant Full-text Search',
      desc: 'Find any concept in milliseconds with Pagefind â€” a fully offline, zero-backend search engine.',
    },
    {
      icon: 'ðŸ”–',
      title: 'Bookmarks & Progress',
      desc: 'Bookmark articles and track recently-read pages so you always know where you left off.',
    },
    {
      icon: 'ðŸ“±',
      title: 'Responsive by Default',
      desc: 'Reads great on any device â€” from a 4K monitor to a phone screen on the commute.',
    },
    {
      icon: 'ðŸš€',
      title: 'Statically Generated',
      desc: 'The entire site is pre-rendered at build time â€” blazing fast, secure, and free to host on Vercel.',
    },
  ];

  const stack = [
    { name: 'Next.js 15', color: '#000000', lightColor: '#ffffff' },
    { name: 'React 19', color: '#61DAFB' },
    { name: 'MDX', color: '#FCB32C' },
    { name: 'Shiki', color: '#3FA7D6' },
    { name: 'Pagefind', color: '#7C5CBF' },
    { name: 'KaTeX', color: '#329894' },
    { name: 'Mermaid', color: '#FF3670' },
    { name: 'Tailwind CSS', color: '#38BDF8' },
    { name: 'Framer Motion', color: '#BB4BFF' },
    { name: 'Vercel', color: '#000000', lightColor: '#ffffff' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Write in Markdown',
      desc: 'Content lives in a separate GitHub repository as plain .md / .mdx files. No CMS, no lock-in.',
    },
    {
      step: '02',
      title: 'Push to GitHub',
      desc: 'A git push triggers an automatic Vercel rebuild â€” the site is live within seconds.',
    },
    {
      step: '03',
      title: 'Read Anywhere',
      desc: 'The statically generated site loads instantly, works offline-ready, and is free to share.',
    },
  ];

  return (
    <PageLayout showSidebar={false}>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <header className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span>âœ¨</span>
            Personal Knowledge Base
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Everything I&apos;ve learned,{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in one place.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {siteConfig.name} is my personal documentation hub â€” a living, growing library of
            notes, guides, and references covering software engineering, system design, and
            everything in between.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Start Reading
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View Source
            </a>
          </div>
        </header>

        {/* â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/60 p-6 text-center backdrop-blur-sm"
            >
              <span className="text-3xl">{s.icon}</span>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* â”€â”€ Story â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mb-20">
          <div
            className="rounded-3xl border border-border/50 p-8 sm:p-12"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.02))',
            }}
          >
            <span className={badge + ' mb-4'}>ðŸ’¡ The Story</span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Why I built this
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Learning to code is one thing. <em>Retaining</em> what you learn is another. After
                years of scattered bookmarks, half-finished Notion pages, and forgotten Stack
                Overflow answers, I decided to build something better.
              </p>
              <p>
                {siteConfig.name} is that &quot;something better&quot; â€” a structured, searchable,
                always-online reference that I can update with a single git push. Every guide is
                written to be clear and opinionated, not just a copy of the official docs.
              </p>
              <p>If you find it useful too, that&apos;s a bonus. ðŸŽ‰</p>
            </div>
          </div>
        </section>

        {/* â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mb-20">
          <div className="mb-8">
            <span className={badge + ' mb-3'}>ðŸŒŸ Features</span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Built for serious learners
            </h2>
            <p className="mt-2 text-muted-foreground">
              Every detail is designed to make reading, finding, and remembering content easier.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className={card}>
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* â”€â”€ How it works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mb-20">
          <div className="mb-8">
            <span className={badge + ' mb-3'}>âš™ï¸ How It Works</span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Simple by design
            </h2>
          </div>
          <div className="relative">
            {/* connector line */}
            <div
              className="absolute left-7 top-10 hidden h-[calc(100%-5rem)] w-px sm:block"
              style={{
                background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.4), transparent)',
              }}
            />
            <div className="space-y-6">
              {steps.map((s) => (
                <div key={s.step} className="flex gap-6">
                  <div
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground shadow-md"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    {s.step}
                  </div>
                  <div className={card + ' flex-1'}>
                    <h3 className="font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ Tech Stack â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mb-20">
          <div className="mb-6">
            <span className={badge + ' mb-3'}>ðŸ› ï¸ Tech Stack</span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Standing on the shoulders of giants
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {stack.map((t) => (
              <span
                key={t.name}
                className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-border hover:shadow-sm"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: t.color }}
                  aria-hidden="true"
                />
                {t.name}
              </span>
            ))}
          </div>
        </section>

        {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section>
          <div
            className="relative overflow-hidden rounded-3xl p-10 text-center sm:p-16"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))',
              border: '1px solid hsl(var(--primary) / 0.2)',
            }}
          >
            {/* decorative blobs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 70%)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)',
              }}
            />

            <h2 className="relative text-2xl font-bold text-foreground sm:text-3xl">
              Ready to dive in?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Browse the docs, search for any topic, or jump straight to a category that interests
              you.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                Browse the Docs
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background/80 px-7 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-accent"
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Star on GitHub
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
