import { cn } from '@/lib/utils';

/**
 * TagBadge — displays a frontmatter tag with a subtle colored background.
 *
 * @param {object} props
 * @param {string} props.tag - Tag text (e.g., "React", "API", "Tutorial").
 * @param {string} [props.className]
 * @returns {React.ReactElement}
 */
export function TagBadge({ tag, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {tag}
    </span>
  );
}

/**
 * DifficultyBadge — displays a difficulty level with semantic coloring.
 *
 * @param {object} props
 * @param {"beginner" | "intermediate" | "advanced"} props.level
 * @param {string} [props.className]
 * @returns {React.ReactElement}
 */
export function DifficultyBadge({ level, className }) {
  const config = {
    beginner: {
      label: 'Beginner',
      classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    },
    intermediate: {
      label: 'Intermediate',
      classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    },
    advanced: {
      label: 'Advanced',
      classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
    },
  };

  const { label, classes } = config[level] || config.beginner;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
