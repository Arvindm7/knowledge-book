'use client';

/**
 * HomeContent — Premium homepage client component.
 *
 * Renders all interactive homepage sections with Framer Motion animations.
 * Receives data from the server component (page.js).
 */

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { useSearch } from '@/components/search/search-provider';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useBookmarksPanel } from '@/providers/bookmarks-panel-provider';
import { FadeIn, FadeInStagger, FadeInStaggerItem, CountUpInner } from '@/components/common/motion';

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

function BookmarkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
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
      {action &&
        (action.onClick ? (
          <button
            onClick={action.onClick}
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            {action.label}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            href={action.href}
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            {action.label}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HomeContent({ categories, recentPages, stats }) {
  const { openSearch } = useSearch();
  const { bookmarks } = useBookmarks();
  const { open: onOpenBookmarks } = useBookmarksPanel();
  const [activeFeature, setActiveFeature] = useState(0);

  // Featured topics — static curated list (displayed as content on the homepage)
  const featuredTopics = [
    {
      title: 'Getting Started',
      description:
        'Begin your learning journey with fundamentals and core concepts that build a strong foundation.',
      icon: '🚀',
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      accentColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
      details: ['Core language fundamentals', 'Setup and environment', 'First project walkthrough'],
    },
    {
      title: 'Architecture',
      description:
        'Explore system design patterns, architectural principles, and scalable application structures.',
      icon: '🏗️',
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
      accentColor: 'text-violet-500',
      borderColor: 'border-violet-500/30',
      details: [
        'Design patterns & principles',
        'MVC, MVVM, Clean Architecture',
        'Scalability strategies',
      ],
    },
    {
      title: 'Best Practices',
      description:
        'Production-grade guidelines, coding standards, and proven methodologies for clean code.',
      icon: '✅',
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      accentColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30',
      details: ['SOLID principles', 'Code review guidelines', 'Testing strategies'],
    },
    {
      title: 'Quick Reference',
      description:
        'Cheat sheets, syntax guides, and ready-to-use code snippets for rapid development.',
      icon: '⚡',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      accentColor: 'text-amber-500',
      borderColor: 'border-amber-500/30',
      details: ['Syntax cheat sheets', 'Common algorithms', 'API reference guides'],
    },
    {
      title: 'Deep Dives',
      description:
        'In-depth explorations of complex topics with detailed examples and visual explanations.',
      icon: '🔬',
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      accentColor: 'text-rose-500',
      borderColor: 'border-rose-500/30',
      details: ['Detailed case studies', 'Step-by-step breakdowns', 'Visual explanations'],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* ── HERO ── */}
      <section className="relative pb-20 pt-16 sm:pb-28 sm:pt-24">
        {/* Subtle gradient background — invisible on mobile, subtle on desktop */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-24 left-1/2 hidden h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl sm:block" />
        </div>

        {/* Heading */}
        <FadeIn delay={0.05} className="text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Everything I know,{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              organized
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.15} className="text-center">
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A curated collection of notes, guides, and references — structured for quick retrieval
            and deep learning.
          </p>
        </FadeIn>

        {/* Search Bar */}
        <FadeIn delay={0.25} className="mt-10 flex justify-center">
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

        {/* CTAs */}
        <FadeIn delay={0.35} className="mt-6 flex items-center justify-center gap-3">
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

        {/* Stats Bar */}
        <FadeIn delay={0.45} className="mt-16">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-4 divide-x divide-border/40">
              {[
                { label: 'Notes', value: stats.totalPages, icon: BookIcon },
                { label: 'Categories', value: stats.totalCategories, icon: FolderIcon },
                {
                  label: 'Last Synced',
                  value: stats.lastSynced
                    ? new Date(stats.lastSynced).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—',
                  isText: true,
                  icon: SyncIcon,
                },
                { label: 'Topics', value: stats.totalTopics, icon: SparklesIcon },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center px-2 py-4 text-center sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-6 sm:text-left"
                >
                  {/* Icon — desktop only */}
                  <div className="hidden shrink-0 rounded-lg bg-primary/5 p-2 sm:block">
                    <stat.icon className="h-5 w-5 text-primary/70" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-lg font-bold leading-none tracking-tight text-foreground sm:text-2xl">
                      {stat.isText ? (
                        <span className="text-sm font-semibold sm:text-lg">{stat.value}</span>
                      ) : (
                        <CountUpInner target={stat.value} duration={1.5} />
                      )}
                    </div>
                    <div className="mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 sm:text-[11px]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    className={`group flex h-full min-h-[72px] items-center gap-4 rounded-xl border ${style.border} ${style.bg} p-4 transition-all hover:shadow-md`}
                  >
                    <span className="text-2xl shrink-0" role="img" aria-hidden="true">
                      {style.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cat.children?.length || 0} notes
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
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
        <FadeIn delay={0.1}>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Topic selector tabs */}
            <div className="flex flex-row gap-2 lg:flex-col lg:gap-1">
              {featuredTopics.map((topic, i) => (
                <button
                  key={topic.title}
                  onClick={() => setActiveFeature(i)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                    activeFeature === i
                      ? `border ${topic.borderColor} bg-gradient-to-r ${topic.gradient} shadow-sm`
                      : 'border border-transparent hover:border-border/50 hover:bg-muted/30'
                  }`}
                >
                  <span className="text-xl shrink-0" role="img" aria-hidden="true">
                    {topic.icon}
                  </span>
                  <div className="hidden sm:block min-w-0">
                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        activeFeature === i
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      {topic.title}
                    </h3>
                  </div>
                  {activeFeature === i && (
                    <motion.div
                      layoutId="active-feature-indicator"
                      className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-current lg:block"
                      style={{ color: 'hsl(var(--primary))' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Active topic showcase */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="relative flex h-full min-h-[280px] flex-col"
                >
                  {/* Animated gradient background */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${featuredTopics[activeFeature].gradient} opacity-60`}
                    aria-hidden="true"
                  />

                  {/* Floating decorative elements */}
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    <motion.div
                      animate={{
                        y: [0, -12, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute right-8 top-8 text-6xl opacity-20 sm:text-8xl sm:opacity-30"
                    >
                      {featuredTopics[activeFeature].icon}
                    </motion.div>
                    <motion.div
                      animate={{
                        y: [0, 8, 0],
                        x: [0, -6, 0],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute bottom-12 right-24 text-4xl opacity-10"
                    >
                      {featuredTopics[activeFeature].icon}
                    </motion.div>

                    {/* Animated dots grid */}
                    <div className="absolute bottom-4 left-4 grid grid-cols-5 gap-2 opacity-15">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="h-1 w-1 rounded-full bg-current"
                          style={{ color: 'hsl(var(--primary))' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-1 flex-col justify-center p-8 sm:p-10">
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="flex items-center gap-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                    >
                      <span className="text-3xl">{featuredTopics[activeFeature].icon}</span>
                      {featuredTopics[activeFeature].title}
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground"
                    >
                      {featuredTopics[activeFeature].description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="mt-5"
                    >
                      <ul className="space-y-2.5">
                        {featuredTopics[activeFeature].details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center gap-2.5 text-sm text-foreground/80"
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${featuredTopics[activeFeature].accentColor.replace('text-', 'bg-')}`}
                            />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Progress dots */}
                    <div className="mt-8 flex items-center gap-2">
                      {featuredTopics.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveFeature(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            activeFeature === i
                              ? 'w-6 bg-primary'
                              : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                          aria-label={`Show ${featuredTopics[i].title}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pb-16">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              A simple pipeline from writing to reading — no databases, no CMS.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12">
          {/* ── Badge + Wiring ── */}
          <FadeIn delay={0.1}>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Powered by
                </span>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  {['Next.js', 'MDX', 'Shiki', 'Pagefind'].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ── Branching Lines (desktop) ── */}
          <div className="relative hidden sm:block" aria-hidden="true">
            <div className="mx-auto h-20 max-w-3xl">
              {/* Vertical trunk from badge */}
              <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-border" />
              {/* Horizontal branch */}
              <div className="absolute left-[16.67%] top-8 h-px w-[66.66%] bg-border" />
              {/* Left vertical drop */}
              <div className="absolute left-[16.67%] top-8 h-12 w-px bg-border" />
              {/* Center vertical drop */}
              <div className="absolute left-1/2 top-8 h-12 w-px -translate-x-1/2 bg-border" />
              {/* Right vertical drop */}
              <div className="absolute right-[16.67%] top-8 h-12 w-px bg-border" />
              {/* Corner pieces — small colored accents at the branch points */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute left-[16.67%] top-[30px] h-2 w-2 -translate-x-1/2 rounded-full bg-blue-500/60"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute left-1/2 top-[30px] h-2 w-2 -translate-x-1/2 rounded-full bg-violet-500/60"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute right-[16.67%] top-[30px] h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500/60"
              />
            </div>
          </div>

          {/* Mobile spacer */}
          <div className="h-8 sm:hidden" />

          {/* ── Step Cards ── */}
          <div className="relative z-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Write in Markdown',
                description:
                  "Create notes in your favorite editor using plain Markdown. Organize files into folders — that's your category structure.",
                accent: 'from-blue-500/10 to-blue-500/5',
                borderHover: 'hover:border-blue-500/30',
                iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
              },
              {
                step: '02',
                icon: '🔄',
                title: 'Push & Auto-Sync',
                description:
                  'Push to GitHub and the site automatically rebuilds. No databases, no CMS — just Git.',
                accent: 'from-violet-500/10 to-violet-500/5',
                borderHover: 'hover:border-violet-500/30',
                iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
              },
              {
                step: '03',
                icon: '🔍',
                title: 'Browse & Search',
                description:
                  'Full-text search, syntax highlighting, dark mode, and a clean reading experience — all generated statically.',
                accent: 'from-emerald-500/10 to-emerald-500/5',
                borderHover: 'hover:border-emerald-500/30',
                iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
              >
                <div
                  className={`h-full rounded-xl border border-border/50 bg-gradient-to-b ${item.accent} p-6 transition-all duration-300 ${item.borderHover} hover:shadow-lg`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YOUR BOOKMARKS ── */}
      {bookmarks.length > 0 && (
        <section className="pb-16">
          <FadeIn>
            <SectionHeader
              icon={BookmarkIcon}
              title="Your Bookmarks"
              subtitle="Pages you've saved for quick access"
              action={
                bookmarks.length > 3
                  ? { label: `View all ${bookmarks.length}`, href: '#', onClick: onOpenBookmarks }
                  : undefined
              }
            />
          </FadeIn>
          <FadeInStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.slice(0, 3).map((bm) => (
              <FadeInStaggerItem key={bm.slug}>
                <Link
                  href={`/docs/${bm.slug}`}
                  className="group flex h-full items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:border-amber-500/40 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <svg
                      className="h-4 w-4 text-amber-600 dark:text-amber-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">{bm.title}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Saved{' '}
                      {new Date(bm.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500" />
                </Link>
              </FadeInStaggerItem>
            ))}
          </FadeInStagger>
          {bookmarks.length > 3 && (
            <FadeIn delay={0.2} className="mt-4 text-center">
              <button
                onClick={onOpenBookmarks}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm font-medium text-amber-600 transition-all hover:border-amber-500/40 hover:bg-amber-500/10 dark:text-amber-400"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
                </svg>
                View all {bookmarks.length} bookmarks
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </FadeIn>
          )}
        </section>
      )}

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

      {/* ── CONTINUE READING (CTA) ── */}
      <section className="pb-20">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl">
            {/* Gradient border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-emerald-500/30 opacity-60" />

            <div className="relative rounded-2xl bg-gradient-to-br from-card via-background to-card p-8 sm:p-12">
              {/* Animated floating particles */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
              >
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0],
                    opacity: [0.15, 0.3, 0.15],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-12 top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-2xl"
                />
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    x: [0, -8, 0],
                    opacity: [0.1, 0.25, 0.1],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-4 left-16 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-2xl"
                />
                {/* Dot grid */}
                <div className="absolute right-4 top-4 grid grid-cols-4 gap-2 opacity-20 sm:right-8 sm:top-8">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="h-1 w-1 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-2xl"
                    >
                      📚
                    </motion.div>
                    <div className="h-px w-12 bg-gradient-to-r from-primary/40 to-transparent" />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Continue your learning journey
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Pick up where you left off, or discover something new in the knowledge base.
                  </p>
                </div>
                <Link
                  href="/docs"
                  className="group/cta relative inline-flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Open Knowledge Base
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
