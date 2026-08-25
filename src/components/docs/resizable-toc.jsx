'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResizeHandle, useResizableWidth } from '@/components/layout/resize-handle';
import { TableOfContents } from './table-of-contents';

const TOC_DEFAULT_WIDTH = 220;
const TOC_MIN_WIDTH = 160;
const TOC_MAX_WIDTH = 360;
const COLLAPSED_KEY = 'docs-toc-collapsed';

/**
 * ResizableToc — wraps the Table of Contents with a drag-to-resize handle
 * and a collapse/expand toggle.
 *
 * When collapsed:
 * - The aside and resize handle disappear completely (zero layout width).
 * - A small tab is fixed to the right viewport edge so the user can re-open
 *   from anywhere on the page without scrolling back to the top.
 * - Collapse state is persisted to localStorage.
 *
 * The collapse button inside the panel is sticky so it remains visible
 * as the user scrolls through the TOC list.
 *
 * @param {object} props
 * @param {Array<{ id: string, text: string, level: number }>} props.headings
 * @returns {React.ReactElement | null}
 */
export function ResizableToc({ headings }) {
  const [tocWidth, setTocWidth] = useResizableWidth(TOC_DEFAULT_WIDTH, 'docs-toc-width');
  const [collapsed, setCollapsed] = useState(() => {
    // Lazy initializer runs only on mount; safe to read localStorage here.
    // Wrapped in try/catch for SSR environments where localStorage is unavailable.
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (!headings || headings.length === 0) return null;

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <>
      {/* Resize handle — only shown when expanded */}
      {!collapsed && (
        <ResizeHandle
          side="right"
          defaultWidth={TOC_DEFAULT_WIDTH}
          minWidth={TOC_MIN_WIDTH}
          maxWidth={TOC_MAX_WIDTH}
          storageKey="docs-toc-width"
          onResize={setTocWidth}
          className="hidden xl:flex"
        />
      )}

      {/* TOC aside — animates in/out, takes up layout space only when expanded */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.aside
            key="toc-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: tocWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            className="sticky top-20 hidden shrink-0 xl:flex xl:flex-col scrollbar-hide overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 5rem)' }}
          >
            {/* ── Sticky header row: "On this page" + collapse button ── */}
            {/* sticky within the aside so it stays visible while the list scrolls */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-background pb-1 pt-0 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </span>
              <button
                onClick={toggle}
                aria-label="Collapse table of contents"
                title="Collapse"
                className="group flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                {/* chevron-right icon */}
                <svg
                  className="h-3.5 w-3.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Scrollable TOC list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <TableOfContents headings={headings} hideTitle />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed tab — fixed to viewport right edge so it's reachable at any scroll depth */}
      <AnimatePresence initial={false}>
        {collapsed && (
          <motion.div
            key="toc-tab"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.18 }}
            className="hidden xl:block"
            style={{
              position: 'fixed',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              zIndex: 40,
            }}
          >
            <button
              onClick={toggle}
              aria-label="Expand table of contents"
              title="Expand table of contents"
              className="flex flex-col items-center gap-1.5 rounded-l-md border border-r-0 border-border/60 bg-card px-1.5 py-3 text-muted-foreground/60 shadow-md transition-colors hover:bg-muted hover:text-foreground"
            >
              {/* chevron-left icon */}
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {/* Rotated label */}
              <span
                className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                Contents
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
