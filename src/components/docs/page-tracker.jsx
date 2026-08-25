'use client';

/**
 * PageTracker — invisible client component that records a page visit.
 *
 * The doc page (`[[...slug]]/page.js`) is a React Server Component, so it
 * cannot call hooks or touch localStorage directly. This thin client wrapper
 * is rendered alongside the content and records the visit on mount.
 *
 * @param {object} props
 * @param {string} props.slug  - URL slug of the current page.
 * @param {string} props.title - Display title of the current page.
 */

import { useEffect } from 'react';
import { recordPageVisit } from '@/hooks/use-recently-read';

export function PageTracker({ slug, title }) {
  useEffect(() => {
    if (slug && title) {
      recordPageVisit(slug, title);
    }
  }, [slug, title]);

  // Renders nothing — purely a side-effect component.
  return null;
}
