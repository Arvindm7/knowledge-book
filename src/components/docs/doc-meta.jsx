import { cn } from '@/lib/utils';
import { TagBadge, DifficultyBadge } from '@/components/common/badges';

/**
 * DocMeta — document metadata display with reading time, last updated,
 * difficulty badge, and tags.
 *
 * @param {object} props
 * @param {number} [props.readingTime]
 * @param {string | null} [props.lastUpdated]
 * @param {string} [props.difficulty]
 * @param {string[]} [props.tags]
 * @param {string} [props.className]
 * @returns {React.ReactElement | null}
 */
export function DocMeta({ readingTime, lastUpdated, difficulty, tags, className }) {
  if (!readingTime && !lastUpdated && !difficulty && !tags?.length) return null;

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Difficulty badge */}
      {difficulty && <DifficultyBadge level={difficulty} />}

      {/* Reading time */}
      {readingTime && (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {readingTime} min read
        </span>
      )}

      {/* Last updated */}
      {formattedDate && (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formattedDate}
        </span>
      )}

      {/* Tags */}
      {tags?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
