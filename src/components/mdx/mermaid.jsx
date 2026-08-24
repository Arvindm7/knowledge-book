'use client';

import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

/**
 * Mermaid diagram renderer.
 *
 * Client-side component that renders Mermaid diagram syntax into SVG.
 * Automatically adapts to the current light/dark theme.
 *
 * Usage in Markdown:
 * ```mermaid
 * graph TD; A-->B;
 * ```
 *
 * Or as a JSX component: <Mermaid chart="graph TD; A-->B;" />
 *
 * @param {object} props
 * @param {string} props.chart - Mermaid diagram definition string.
 * @returns {React.ReactElement}
 */
export function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const reactId = useId();
  const mermaidId = `mermaid-${reactId.replace(/:/g, '')}`;
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    const mermaidTheme = resolvedTheme === 'dark' ? 'dark' : 'default';

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'inherit', // inherits from the container, which resets to text-sm
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
      sequence: {
        useMaxWidth: true,
      },
    });

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function renderDiagram() {
      try {
        // Ensure any stale SVG from a previous render is cleared before re-rendering
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        const { svg } = await mermaid.render(mermaidId, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to render diagram');
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, mermaidId, resolvedTheme]);

  return (
    <figure className="mermaid-figure my-6 w-full text-sm">
      {/* Loading skeleton */}
      {isLoading && !error && (
        <div className="flex h-32 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Rendering diagram…
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
          <p className="mb-1 text-sm font-medium text-destructive">Mermaid diagram error</p>
          <pre className="overflow-x-auto text-xs text-destructive/80 whitespace-pre-wrap">
            {error}
          </pre>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              Show source
            </summary>
            <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2 text-xs text-foreground/80">
              {chart}
            </pre>
          </details>
        </div>
      )}

      {/* Diagram container */}
      <div
        ref={containerRef}
        className="flex justify-center overflow-x-auto rounded-lg border border-border/60 bg-card p-4 [&_svg]:max-w-full"
        aria-label="Mermaid diagram"
        style={{ display: isLoading || error ? 'none' : undefined }}
      />
    </figure>
  );
}
