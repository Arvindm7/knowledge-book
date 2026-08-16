'use client';

/**
 * SwipeNavigation — Touch swipe gesture handler for mobile doc navigation.
 *
 * Wraps doc content and listens for horizontal swipe gestures:
 *   - Swipe LEFT  → navigate to next page
 *   - Swipe RIGHT → navigate to previous page
 *
 * Features:
 * - Only activates on touch devices (pointer: coarse)
 * - Requires a minimum swipe distance to prevent accidental triggers
 * - Ignores swipes that are more vertical than horizontal (scrolling)
 * - Shows a subtle animated hint indicator while swiping
 * - No dependencies beyond framer-motion (already in use)
 */

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const SWIPE_THRESHOLD = 60; // minimum px to count as a swipe
const ANGLE_THRESHOLD = 0.5; // max vertical/horizontal ratio (30°)

function ArrowIcon({ direction }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      )}
    </svg>
  );
}

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {{ slug: string, title: string } | null} props.prev
 * @param {{ slug: string, title: string } | null} props.next
 */
export function SwipeNavigation({ children, prev, next }) {
  const router = useRouter();
  const touchStart = useRef(null);
  const [hint, setHint] = useState(null); // 'prev' | 'next' | null

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setHint(null);
  }, []);

  const onTouchMove = useCallback(
    (e) => {
      if (!touchStart.current) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;

      // Only show hint if movement is mainly horizontal
      if (Math.abs(dy) / Math.abs(dx || 1) > ANGLE_THRESHOLD) return;

      if (dx < -20 && next) setHint('next');
      else if (dx > 20 && prev) setHint('prev');
      else setHint(null);
    },
    [prev, next]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;

      touchStart.current = null;
      setHint(null);

      // Ignore if too vertical
      if (Math.abs(dy) / Math.abs(dx || 1) > ANGLE_THRESHOLD) return;

      if (dx < -SWIPE_THRESHOLD && next) {
        router.push(`/docs/${next.slug}`);
      } else if (dx > SWIPE_THRESHOLD && prev) {
        router.push(`/docs/${prev.slug}`);
      }
    },
    [prev, next, router]
  );

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}

      {/* Swipe hint overlay — only shown while swiping */}
      <AnimatePresence>
        {hint === 'prev' && prev && (
          <motion.div
            key="prev-hint"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed bottom-24 left-4 z-50 flex items-center gap-2 rounded-xl border border-border/60 bg-background/90 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-md sm:hidden"
            aria-hidden="true"
          >
            <ArrowIcon direction="left" />
            <span className="max-w-[140px] truncate">{prev.title}</span>
          </motion.div>
        )}
        {hint === 'next' && next && (
          <motion.div
            key="next-hint"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-xl border border-border/60 bg-background/90 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-md sm:hidden"
            aria-hidden="true"
          >
            <span className="max-w-[140px] truncate">{next.title}</span>
            <ArrowIcon direction="right" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
