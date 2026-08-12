'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Sidebar — Stripe/Vercel-inspired documentation sidebar.
 *
 * Features:
 * - Sticky positioning within the docs layout
 * - Unlimited nested folder depth
 * - Animated expand/collapse with chevron rotation
 * - Active link highlighting with animated sliding indicator
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
 * Active items get a smooth animated background + left accent bar
 * using Framer Motion's layoutId for sliding transitions.
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
          'relative block rounded-md px-2 py-1.5 text-sm transition-all duration-150',
          isActive
            ? 'font-medium text-primary'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        {/* Animated active background */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 rounded-md bg-primary/10"
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
            }}
          />
        )}
        {/* Animated left accent bar */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary"
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
            }}
          />
        )}
        <span className="relative truncate">{item.title}</span>
      </Link>
    </li>
  );
}
