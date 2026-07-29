'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Theme provider wrapper for the application.
 *
 * Wraps next-themes' ThemeProvider as a client component boundary,
 * keeping the root layout as a server component. Supports light,
 * dark, and system-preference themes.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 * @returns {React.ReactElement}
 */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
