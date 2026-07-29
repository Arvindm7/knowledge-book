'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CommandPalette } from './command-palette';

const SearchContext = createContext({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

/**
 * useSearch — hook to programmatically open/close the search palette.
 */
export function useSearch() {
  return useContext(SearchContext);
}

/**
 * SearchProvider — global search context + keyboard shortcut handler.
 *
 * Wraps the app to provide:
 * - Ctrl+K / Cmd+K shortcut to toggle search
 * - CommandPalette rendering
 * - Context for other components to trigger search
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContext value={{ isOpen, openSearch, closeSearch }}>
      {children}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </SearchContext>
  );
}
