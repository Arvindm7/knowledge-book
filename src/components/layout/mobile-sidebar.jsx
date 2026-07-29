'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

/**
 * MobileSidebar — Sheet-based slide-out navigation for mobile and tablet.
 *
 * @param {object} props
 * @param {boolean} props.open - Whether the sheet is open.
 * @param {function} props.onOpenChange - Callback to toggle open state.
 * @param {Array} [props.navItems=[]] - Documentation navigation tree.
 * @returns {React.ReactElement}
 */
export function MobileSidebar({ open, onOpenChange, navItems = [] }) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 overflow-y-auto p-0">
        <SheetHeader className="border-b border-border/40 px-4 py-4">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <svg
                className="h-4 w-4 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            {siteConfig.name}
          </SheetTitle>
        </SheetHeader>

        {/* Primary nav links */}
        <div className="border-b border-border/40 px-4 py-3">
          <nav className="space-y-1" aria-label="Primary navigation">
            {siteConfig.navItems.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Docs navigation tree */}
        {navItems.length > 0 && (
          <div className="px-4 py-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Documentation
            </p>
            <MobileNavTree
              items={navItems}
              pathname={pathname}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Recursive mobile navigation tree.
 */
function MobileNavTree({ items, pathname, onNavigate, depth = 0 }) {
  return (
    <ul className={cn('space-y-0.5', depth > 0 && 'ml-3 border-l border-border/30 pl-3')}>
      {items.map((item) => (
        <MobileNavItem
          key={item.slug || item.title}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function MobileNavItem({ item, pathname, onNavigate, depth }) {
  const href = `/docs/${item.slug}`;
  const isActive = pathname === href;
  const hasChildren = item.children?.length > 0;
  const isWithinSection = hasChildren && pathname.startsWith(`/docs/${item.slug}`);
  const [isExpanded, setIsExpanded] = useState(isWithinSection);

  if (item.isDirectory && hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50',
            isWithinSection ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}
          aria-expanded={isExpanded}
        >
          <span>{item.title}</span>
          <svg
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {isExpanded && (
          <MobileNavTree
            items={item.children}
            pathname={pathname}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50',
          isActive
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {item.title}
      </Link>
    </li>
  );
}
