'use client';

import { useEffect, useId, useRef } from 'react';
import mermaid from 'mermaid';

/**
 * Mermaid diagram renderer.
 *
 * Client-side component that renders Mermaid diagram syntax into SVG.
 * Used as a custom MDX component: <Mermaid chart="graph TD; A-->B;" />
 *
 * @param {object} props
 * @param {string} props.chart - Mermaid diagram definition string.
 * @returns {React.ReactElement}
 */
export function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const reactId = useId();
  const mermaidId = `mermaid-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    let cancelled = false;

    async function renderDiagram() {
      try {
        const { svg } = await mermaid.render(mermaidId, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML =
            '<p class="text-sm text-destructive">Failed to render Mermaid diagram.</p>';
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, mermaidId]);

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-border bg-card p-4"
      aria-label="Mermaid diagram"
    />
  );
}
