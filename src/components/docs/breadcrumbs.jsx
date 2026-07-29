import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Breadcrumbs — polished breadcrumb trail with chevron separators.
 *
 * @param {object} props
 * @param {Array<{ label: string, href: string }>} props.items
 * @param {string} [props.className]
 * @returns {React.ReactElement | null}
 */
export function Breadcrumbs({ items, className }) {
  if (!items || items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <svg
                  className="h-3.5 w-3.5 text-muted-foreground/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
