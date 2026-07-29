'use client';

/**
 * Motion Components — Reusable Framer Motion wrappers.
 *
 * Provides consistent animation patterns across the site.
 * All animations respect user `prefers-reduced-motion` via Framer Motion defaults.
 */

import { useEffect, useState } from 'react';
import { motion, animate as motionAnimate } from 'framer-motion';

/** Custom easing for premium feel. */
const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98];

/**
 * FadeIn — Fades and slides content up on mount.
 */
export function FadeIn({ children, delay = 0, duration = 0.5, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeInStagger — Container that staggers children animations.
 */
export function FadeInStagger({ children, staggerDelay = 0.08, className }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeInStaggerItem — Child element that animates when parent triggers.
 */
export function FadeInStaggerItem({ children, className }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: EASE_OUT_EXPO },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn — Scales content in from slightly smaller.
 */
export function ScaleIn({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUpInner — Animated number counter using Framer Motion's `animate` utility.
 */
export function CountUpInner({ target, duration = 1.5, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = motionAnimate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration]);

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
