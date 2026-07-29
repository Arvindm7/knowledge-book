'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// Stable subscription for mount detection (avoids useEffect+setState)
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * ThemeToggle — cycles through light, dark, and system themes.
 *
 * Renders a button with an animated icon that morphs between sun,
 * moon, and monitor icons. Mounts only after hydration to avoid
 * mismatches.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @returns {React.ReactElement | null}
 */
export function ThemeToggle({ className }) {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    // Render a placeholder to avoid layout shift
    return (
      <button
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground',
          className
        )}
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  function cycleTheme() {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  }

  const label =
    theme === 'light'
      ? 'Switch to dark mode'
      : theme === 'dark'
        ? 'Switch to system mode'
        : 'Switch to light mode';

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={label}
      title={label}
    >
      {/* Sun */}
      <svg
        className={cn(
          'h-4 w-4 transition-all duration-300',
          theme === 'light' ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon */}
      <svg
        className={cn(
          'h-4 w-4 transition-all duration-300',
          theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Monitor (system) */}
      <svg
        className={cn(
          'h-4 w-4 transition-all duration-300',
          theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </button>
  );
}
