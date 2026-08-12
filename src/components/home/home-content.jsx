'use client';

/**
 * HomeContent — Premium homepage client component.
 *
 * Renders all interactive homepage sections with Framer Motion animations.
 * Receives data from the server component (page.js).
 */

import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useSearch } from '@/components/search/search-provider';
import {
  FadeIn,
  FadeInStagger,
  FadeInStaggerItem,
  ScaleIn,
  CountUpInner,
} from '@/components/common/motion';

// ─── Icons (inline SVG for zero-dependency) ──────────────────────────────────

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function FolderIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function SyncIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992"
      />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

// ─── Category colors ─────────────────────────────────────────────────────────

const CATEGORY_STYLES = [
  { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', icon: '📐' },
  { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20', icon: '💻' },
  {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    icon: '🧪',
  },
  { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: '⚙️' },
  { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', icon: '🎨' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', icon: '🌐' },
];

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
        >
          {action.label}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HomeContent({ categories, recentPages, stats }) {
  const { openSearch } = useSearch();

  // Featured topics — static curated list
  const featuredTopics = [
    {
      title: 'Getting Started',
      description: 'Start your learning journey here',
      href: '/docs',
      icon: '🚀',
    },
    { title: 'Architecture', description: 'System design and patterns', href: '/docs', icon: '🏗️' },
    {
      title: 'Best Practices',
      description: 'Production-grade guidelines',
      href: '/docs',
      icon: '✅',
    },
    {
      title: 'Quick Reference',
      description: 'Cheat sheets and snippets',
      href: '/docs',
      icon: '⚡',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* ── HERO ── */}
      <section className="relative pb-16 pt-12 sm:pb-24 sm:pt-20">
        {/* Subtle gradient orb background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <FadeIn className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Personal Knowledge Base
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Everything I know,{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              organized
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2} className="text-center">
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A curated collection of notes, guides, and references — structured for quick retrieval
            and deep learning.
          </p>
        </FadeIn>

        {/* Global Search Bar */}
        <FadeIn delay={0.3} className="mt-10 flex justify-center">
          <button
            onClick={openSearch}
            className="group flex h-12 w-full max-w-lg items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-5 text-sm text-muted-foreground shadow-lg shadow-black/5 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Search documentation"
          >
            <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
            <span className="flex-1 text-left">Search notes, guides, and references...</span>
            <kbd className="hidden rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline-block">
              Ctrl K
            </kbd>
          </button>
        </FadeIn>

        {/* Quick CTAs */}
        <FadeIn delay={0.4} className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            Browse All Notes
            <ArrowRightIcon className="h-3.5 w-3.5" />
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
            Source
          </a>
        </FadeIn>
      </section>

      {/* ── STATISTICS ── */}
      <section className="pb-16">
        <FadeIn delay={0.5}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Notes', value: stats.totalPages, icon: BookIcon },
              { label: 'Categories', value: stats.totalCategories, icon: FolderIcon },
              {
                label: 'Last Synced',
                value: stats.lastSynced
                  ? new Date(stats.lastSynced).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Not synced',
                isText: true,
                icon: SyncIcon,
              },
              { label: 'Topics Covered', value: stats.totalTopics, icon: SparklesIcon },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-xl border border-border/50 bg-card/50 p-5 text-center transition-all hover:border-border hover:bg-card hover:shadow-sm"
              >
                <stat.icon
                  className="mx-auto mb-3 h-5 w-5 text-muted-foreground/60 transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
                <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {stat.isText ? (
                    <span className="text-lg sm:text-xl">{stat.value}</span>
                  ) : (
                    <CountUpInner target={stat.value} duration={1.5} suffix={stat.suffix || ''} />
                  )}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="pb-16">
          <FadeIn>
            <SectionHeader
              icon={FolderIcon}
              title="Categories"
              subtitle="Browse by topic area"
              action={{ label: 'View all', href: '/docs' }}
            />
          </FadeIn>
          <FadeInStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((cat, i) => {
              const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
              return (
                <FadeInStaggerItem key={cat.slug}>
                  <Link
                    href={cat.href || `/docs/${cat.slug}`}
                    className={`group flex items-center gap-4 rounded-xl border ${style.border} ${style.bg} p-4 transition-all hover:shadow-md`}
                  >
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {style.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cat.children?.length || 0} notes
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </FadeInStaggerItem>
              );
            })}
          </FadeInStagger>
        </section>
      )}

      {/* ── FEATURED TOPICS ── */}
      <section className="pb-16">
        <FadeIn>
          <SectionHeader
            icon={SparklesIcon}
            title="Featured Topics"
            subtitle="Curated starting points for your exploration"
          />
        </FadeIn>
        <FadeInStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTopics.map((topic) => (
            <FadeInStaggerItem key={topic.title}>
              <Link
                href={topic.href}
                className="group flex flex-col rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:bg-card hover:shadow-md"
              >
                <span className="mb-3 text-3xl">{topic.icon}</span>
                <h3 className="text-sm font-semibold text-foreground">{topic.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
                  Explore
                  <ArrowRightIcon className="h-3 w-3" />
                </span>
              </Link>
            </FadeInStaggerItem>
          ))}
        </FadeInStagger>
      </section>

      {/* ── RECENTLY UPDATED ── */}
      {recentPages.length > 0 && (
        <section className="pb-16">
          <FadeIn>
            <SectionHeader
              icon={ClockIcon}
              title="Recently Updated"
              subtitle="Latest additions and revisions"
              action={{ label: 'View all', href: '/docs' }}
            />
          </FadeIn>
          <FadeInStagger className="space-y-2">
            {recentPages.slice(0, 5).map((page) => (
              <FadeInStaggerItem key={page.slug}>
                <Link
                  href={`/docs/${page.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-transparent bg-transparent p-4 transition-all hover:border-border/50 hover:bg-card/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    <BookIcon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">{page.title}</h3>
                    {page.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {page.description}
                      </p>
                    )}
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    {page.readingTimeMinutes && (
                      <span className="text-xs text-muted-foreground/60">
                        {page.readingTimeMinutes} min read
                      </span>
                    )}
                  </div>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </FadeInStaggerItem>
            ))}
          </FadeInStagger>
        </section>
      )}

      {/* ── LEARNING PROGRESS ── */}
      <section className="pb-16">
        <FadeIn>
          <SectionHeader
            icon={ChartIcon}
            title="Learning Progress"
            subtitle="Your knowledge base at a glance"
          />
        </FadeIn>
        <ScaleIn delay={0.1}>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Coverage meter */}
              <div className="text-center">
                <div className="relative mx-auto mb-3 h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted/50"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-primary"
                      strokeDasharray={`${Math.min(stats.totalPages * 3, 213.6)} 213.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                    {Math.min(stats.totalPages * 3, 100)}%
                  </span>
                </div>
                <p className="text-xs font-medium text-muted-foreground">Content Coverage</p>
              </div>

              {/* Recent activity */}
              <div className="text-center">
                <div className="mb-3 flex h-20 items-end justify-center gap-1">
                  {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                    <div
                      key={i}
                      className="w-3 rounded-t bg-primary/20 transition-colors hover:bg-primary/40"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-muted-foreground">Weekly Activity</p>
              </div>

              {/* Difficulty breakdown */}
              <div>
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Beginner', pct: 45, color: 'bg-emerald-500' },
                    { label: 'Intermediate', pct: 35, color: 'bg-amber-500' },
                    { label: 'Advanced', pct: 20, color: 'bg-rose-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                  Difficulty Spread
                </p>
              </div>
            </div>
          </div>
        </ScaleIn>
      </section>

      {/* ── CONTINUE READING (CTA) ── */}
      <section className="pb-20">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 sm:p-12">
            {/* Decorative dots */}
            <div
              className="pointer-events-none absolute right-0 top-0 -z-10 h-48 w-48 opacity-30"
              aria-hidden="true"
            >
              <div className="grid h-full w-full grid-cols-6 gap-2 p-4">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-primary/30" />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Continue your learning journey
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Pick up where you left off, or discover something new in the knowledge base.
                </p>
              </div>
              <Link
                href="/docs"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Open Knowledge Base
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
