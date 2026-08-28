import { cn } from '@/lib/utils';

/**
 * Callout / Alert component for MDX.
 *
 * Renders GitHub-flavored Markdown alerts ([!NOTE], [!TIP], [!IMPORTANT],
 * [!WARNING], [!CAUTION]) as beautifully styled, accessible callout boxes.
 */

const CALLOUT_THEMES = {
  note: {
    title: 'Note',
    border: 'border-blue-500/30 border-l-blue-500 dark:border-blue-400/30 dark:border-l-blue-400',
    bg: 'bg-blue-50/60 dark:bg-blue-950/30',
    titleColor: 'text-blue-900 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  tip: {
    title: 'Tip',
    border:
      'border-emerald-500/30 border-l-emerald-500 dark:border-emerald-400/30 dark:border-l-emerald-400',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    titleColor: 'text-emerald-900 dark:text-emerald-200',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  important: {
    title: 'Important',
    border:
      'border-purple-500/30 border-l-purple-500 dark:border-purple-400/30 dark:border-l-purple-400',
    bg: 'bg-purple-50/60 dark:bg-purple-950/30',
    titleColor: 'text-purple-900 dark:text-purple-200',
    iconColor: 'text-purple-600 dark:text-purple-400',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  warning: {
    title: 'Warning',
    border:
      'border-amber-500/30 border-l-amber-500 dark:border-amber-400/30 dark:border-l-amber-400',
    bg: 'bg-amber-50/60 dark:bg-amber-950/30',
    titleColor: 'text-amber-900 dark:text-amber-200',
    iconColor: 'text-amber-600 dark:text-amber-400',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  caution: {
    title: 'Caution',
    border: 'border-rose-500/30 border-l-rose-500 dark:border-rose-400/30 dark:border-l-rose-400',
    bg: 'bg-rose-50/60 dark:bg-rose-950/30',
    titleColor: 'text-rose-900 dark:text-rose-200',
    iconColor: 'text-rose-600 dark:text-rose-400',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

export function Callout({ type = 'note', title, className, children }) {
  const normalizedType = String(type).toLowerCase();
  const theme = CALLOUT_THEMES[normalizedType] || CALLOUT_THEMES.note;
  const displayTitle = title || theme.title;

  return (
    <aside
      role="region"
      aria-label={displayTitle}
      className={cn(
        'my-6 rounded-xl border border-l-4 p-4 text-sm leading-relaxed transition-colors shadow-2xs',
        theme.border,
        theme.bg,
        className
      )}
    >
      <div className={cn('flex items-center gap-2 font-semibold text-sm mb-2', theme.titleColor)}>
        <span className={theme.iconColor}>{theme.icon}</span>
        <span>{displayTitle}</span>
      </div>
      <div className="text-foreground/90 leading-relaxed [&>p]:mt-2 [&>p:first-child]:mt-0 [&>ul]:my-2 [&>ol]:my-2">
        {children}
      </div>
    </aside>
  );
}
