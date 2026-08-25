'use client';

/**
 * useRecentlyRead — localStorage-backed recently-visited pages hook.
 *
 * Tracks the last N pages the user has opened in the docs.
 * Each entry: { slug, title, visitedAt (ISO string) }
 *
 * Call `recordVisit(slug, title)` from a client component on page load
 * to push a new entry to the front of the list.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'knowledge-book-recently-read';
const MAX_ENTRIES = 10;

function readEntries() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Records a page visit. Moves the page to the front of the list if already
 * present (deduplication), then trims to MAX_ENTRIES.
 *
 * @param {string} slug
 * @param {string} title
 */
export function recordPageVisit(slug, title) {
  if (typeof window === 'undefined') return;
  const existing = readEntries().filter((e) => e.slug !== slug);
  const next = [{ slug, title, visitedAt: new Date().toISOString() }, ...existing].slice(
    0,
    MAX_ENTRIES
  );
  writeEntries(next);
  // Notify other tabs / same-page listeners
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}

export function useRecentlyRead() {
  const [entries, setEntries] = useState(() => readEntries());

  // Sync when storage changes (other tabs or recordPageVisit calls)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setEntries(readEntries());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const clearHistory = useCallback(() => {
    writeEntries([]);
    setEntries([]);
  }, []);

  return { entries, clearHistory };
}
