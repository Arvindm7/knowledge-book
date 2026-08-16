'use client';

/**
 * BookmarksPanelContext — lightweight context for opening the bookmarks panel
 * from anywhere in the tree (e.g., the home page "View all" button).
 */

import { createContext, useContext, useState, useCallback } from 'react';

const BookmarksPanelContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function BookmarksPanelProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <BookmarksPanelContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </BookmarksPanelContext.Provider>
  );
}

export function useBookmarksPanel() {
  return useContext(BookmarksPanelContext);
}
