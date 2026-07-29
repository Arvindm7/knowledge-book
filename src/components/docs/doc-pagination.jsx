import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Previous / Next documentation page navigation.
 *
 * Renders a two-column footer with links to the adjacent pages
 * in the documentation order.
 *
 * @param {object} props
 * @param {{ title: string, slug: string } | null} props.prev
 * @param {{ title: string, slug: string } | null} props.next
 * @param {string} [props.className]
 * @returns {React.ReactElement | null}
 */
export function DocPagination({ prev, next, className }) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn('mt-12 flex items-stretch gap-4 border-t border-border pt-6', className)}
    >
      {/* Previous */}
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex flex-1 flex-col items-start rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <span className="text-xs font-medium text-muted-foreground">← Previous</span>
          <span className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Next */}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-1 flex-col items-end rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <span className="text-xs font-medium text-muted-foreground">Next →</span>
          <span className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
