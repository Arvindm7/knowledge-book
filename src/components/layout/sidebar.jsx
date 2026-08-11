'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Sidebar — Stripe/Vercel-inspired documentation sidebar.
 *
 * Features:
 * - Sticky positioning within the docs layout
 * - Unlimited nested folder depth
 * - Animated expand/collapse with chevron rotation
 * - Active link highlighting and auto-expansion
 * - Thin scrollbar styling
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {Array} [props.navItems=[]] - Navigation tree from getDocsNavigationTree().
 * @returns {React.ReactElement}
 */
export function Sidebar({ className, navItems = [], style }) {
  return (
    <aside className={cn('hidden shrink-0 lg:block', className)} style={style}>
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain border-r border-border/40 py-6 pr-2 pl-6 scrollbar-thin">
        <nav aria-label="Documentation navigation" className="space-y-6">
          {navItems.length > 0 ? (
            <NavTree items={navItems} />
          ) : (
            <div className="space-y-2 px-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}

/**
 * Recursive navigation tree renderer.
 * Supports unlimited nesting depth.
 */
function NavTree({ items, depth = 0 }) {
  return (
    <ul
      className={cn('space-y-0.5', depth > 0 && 'ml-3 border-l border-border/40 pl-3')}
      role="list"
    >
      {items.map((item) => (
        <NavItem key={item.slug || item.title} item={item} depth={depth} />
      ))}
    </ul>
  );
}

/**
 * Single navigation item — either a link or a collapsible section.
 */
function NavItem({ item, depth }) {
  const pathname = usePathname();
  const href = `/docs/${item.slug}`;
  const isActive = pathname === href || pathname === `${href}/`;
  const hasChildren = item.children?.length > 0;
  const isWithinSection = hasChildren && pathname.startsWith(`/docs/${item.slug}`);
  const [isExpanded, setIsExpanded] = useState(isWithinSection);

  if (item.isDirectory && hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/50',
            isWithinSection
              ? 'font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-expanded={isExpanded}
        >
          <span className="truncate">{item.title}</span>
          <svg
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'mt-0.5 max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <NavTree items={item.children} depth={depth + 1} />
        </div>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'block rounded-md px-2 py-1.5 text-sm transition-all duration-150',
          isActive
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        <span className="truncate">{item.title}</span>
      </Link>
    </li>
  );
}
