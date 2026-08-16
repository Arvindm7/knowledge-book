'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * TableOfContents — sticky right-rail with scroll-spy and animated active indicator.
 *
 * Features:
 * - IntersectionObserver-based active heading tracking
 * - Smooth animated indicator that slides to the active item (measured from DOM)
 * - Progress bar showing read percentage
 * - Smooth scroll on click
 *
 * @param {object} props
 * @param {Array<{ id: string, text: string, level: number }>} props.headings
 * @param {string} [props.className]
 * @returns {React.ReactElement | null}
 */
export function TableOfContents({ headings, className }) {
  const [activeId, setActiveId] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const observerRef = useRef(null);
  const itemRefs = useRef({});
  const listRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });

  // Measure the active item and position the indicator
  const updateIndicator = useCallback(() => {
    if (!activeId || !listRef.current) return;
    const activeEl = itemRefs.current[activeId];
    if (!activeEl) return;

    const listRect = listRef.current.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    setIndicatorStyle({
      top: itemRect.top - listRect.top,
      height: itemRect.height,
      opacity: 1,
    });
  }, [activeId]);

  // Update indicator when activeId changes
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Auto-scroll the active item into view within the TOC container
  useEffect(() => {
    if (!activeId) return;
    const activeEl = itemRefs.current[activeId];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setReadProgress(Math.min(1, window.scrollY / scrollHeight));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active heading detection
  useEffect(() => {
    if (!headings.length) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
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

  return (
    <nav
      aria-label="Table of contents"
      className={cn('flex flex-col', className)}
      style={{ maxHeight: 'calc(100vh - 5rem)' }}
    >
      {/* Pinned header — always visible, never scrolls */}
      <div className="shrink-0">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            On this page
          </p>
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground/50">
            {Math.round(readProgress * 100)}%
          </span>
        </div>

        {/* Read progress bar */}
        <div className="mb-4 h-0.5 w-full overflow-hidden rounded-full bg-border/40">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${readProgress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Scrollable heading list */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        <div className="relative" ref={listRef}>
          {/* Track line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40" />

          {/* Animated active indicator */}
          <motion.div
            className="absolute left-0 w-0.5 rounded-full bg-primary"
            animate={{
              top: indicatorStyle.top,
              height: indicatorStyle.height,
              opacity: indicatorStyle.opacity,
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 30,
              mass: 0.8,
            }}
          />

          <ul className="space-y-0.5 pl-3">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              return (
                <li key={heading.id}>
                  <a
                    ref={(el) => {
                      if (el) itemRefs.current[heading.id] = el;
                    }}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(heading.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        window.history.pushState(null, '', `#${heading.id}`);
                      }
                    }}
                    className={cn(
                      'block rounded-r-md py-1.5 text-[13px] leading-snug transition-all duration-200',
                      heading.level === 3 && 'pl-3',
                      heading.level === 4 && 'pl-6',
                      isActive
                        ? 'font-medium text-primary'
                        : 'text-muted-foreground/70 hover:text-foreground'
                    )}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
