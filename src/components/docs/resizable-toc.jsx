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
 * - The aside and resize handle are hidden.
 * - A small floating tab appears at the right edge so the user can re-open.
 * - Collapse state is persisted to localStorage.
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

      {/* TOC aside — animates in/out */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.aside
            key="toc-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: tocWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            className="sticky top-20 hidden shrink-0 xl:block scrollbar-hide overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto' }}
          >
            {/* Collapse button — top-right of the panel */}
            <div className="flex items-center justify-between pb-1">
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

            <TableOfContents headings={headings} hideTitle />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed tab — floats at the right edge to re-open */}
      <AnimatePresence initial={false}>
        {collapsed && (
          <motion.div
            key="toc-tab"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
            className="sticky top-24 hidden xl:flex shrink-0 flex-col items-center"
          >
            <button
              onClick={toggle}
              aria-label="Expand table of contents"
              title="Expand table of contents"
              className="flex flex-col items-center gap-1.5 rounded-l-md border border-r-0 border-border/60 bg-card px-1.5 py-3 text-muted-foreground/60 shadow-sm transition-colors hover:bg-muted hover:text-foreground"
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
