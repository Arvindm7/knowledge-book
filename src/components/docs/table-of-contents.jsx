'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * TableOfContents — sticky right-rail with scroll-spy and progress indicator.
 *
 * Features:
 * - IntersectionObserver-based active heading tracking
 * - Visual progress indicator line along the left edge
 * - Smooth scroll on click
 * - Responsive: hidden on smaller screens
 *
 * @param {object} props
 * @param {Array<{ id: string, text: string, level: number }>} props.headings
 * @param {string} [props.className]
 * @returns {React.ReactElement | null}
 */
export function TableOfContents({ headings, className }) {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef(null);

  useEffect(() => {
    if (!headings.length) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry (top of viewport wins)
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          // Pick the one closest to top
          const sorted = intersecting.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveId(sorted[0].target.id);
        }
      },
      {
        rootMargin: '-64px 0px -70% 0px',
        threshold: 0,
      }
    );

    observerRef.current = observer;

    // Slight delay to let rehype-slug finish rendering
    const timeout = setTimeout(() => {
      const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);

      for (const el of elements) {
        observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [headings]);

  if (!headings.length) return null;

  // Calculate active index for the progress indicator
  const activeIndex = headings.findIndex((h) => h.id === activeId);

  return (
    <nav aria-label="Table of contents" className={cn('space-y-1', className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <div className="relative">
        {/* Progress indicator track */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" />

        {/* Active indicator */}
        {activeIndex >= 0 && (
          <div
            className="absolute left-0 w-0.5 rounded-full bg-primary transition-all duration-300 ease-out"
            style={{
              top: `${activeIndex * 28 + 2}px`,
              height: '24px',
            }}
          />
        )}

        <ul className="space-y-0.5 pl-3">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      // Update URL hash without scrolling
                      window.history.pushState(null, '', `#${heading.id}`);
                    }
                  }}
                  className={cn(
                    'block py-1 text-[13px] leading-snug transition-colors duration-150',
                    heading.level === 3 && 'pl-3',
                    heading.level === 4 && 'pl-6',
                    isActive
                      ? 'font-medium text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
