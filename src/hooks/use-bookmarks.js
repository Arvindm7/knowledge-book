'use client';

/**
 * useBookmarks — localStorage-backed bookmark management hook.
 *
 * Provides methods to add, remove, toggle, and check bookmarks.
 * Bookmarks are stored as an array of { slug, title, timestamp } objects.
 * Syncs across tabs via the `storage` event.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'knowledge-book-bookmarks';

function readBookmarks() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Storage full or unavailable
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => readBookmarks());

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setBookmarks(readBookmarks());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addBookmark = useCallback((slug, title) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.slug === slug)) return prev;
      const next = [{ slug, title, timestamp: Date.now() }, ...prev];
      writeBookmarks(next);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((slug) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.slug !== slug);
      writeBookmarks(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((slug, title) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.slug === slug);
      const next = exists
        ? prev.filter((b) => b.slug !== slug)
        : [{ slug, title, timestamp: Date.now() }, ...prev];
      writeBookmarks(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((slug) => bookmarks.some((b) => b.slug === slug), [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked };
}
