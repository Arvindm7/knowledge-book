'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

/**
 * Mermaid diagram renderer with zoom / pan controls.
 *
 * Client-side component that renders Mermaid diagram syntax into SVG.
 * Automatically adapts to the current light/dark theme and provides
 * zoom-in, zoom-out and reset buttons plus mouse-drag panning.
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

// Mermaid SVG text does not inherit font-size from CSS — must be set explicitly.
const DIAGRAM_FONT_SIZE = 14;
const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;

export function Mermaid({ chart }) {
  // containerRef: the div whose innerHTML is set to the rendered SVG (and panned via translate)
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  // natural SVG dimensions parsed from the viewBox — used for crisp attribute-based resize
  const naturalSizeRef = useRef({ w: 0, h: 0 });
  const reactId = useId();
  const mermaidId = `mermaid-${reactId.replace(/:/g, '')}`;
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // zoom/pan state stored in refs to avoid re-renders on every mouse move
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const [zoom, setZoom] = useState(1); // only for button label / aria

  /* ── helpers ────────────────────────────────────────────────────────────── */

  /**
   * Applies the current zoom and pan without CSS scale.
   * Zoom is applied by resizing the SVG's width/height attributes directly so the
   * browser re-renders the vector at full resolution — no blur at any zoom level.
   * Pan is applied as a CSS translate on the container div.
   */
  const applyTransform = useCallback(() => {
    if (!containerRef.current) return;
    // Pan: translate the container
    const { x, y } = panRef.current;
    containerRef.current.style.transform = `translate(${x}px, ${y}px)`;
    // Zoom: resize SVG attributes → crisp vector rendering at every level
    const svgEl = containerRef.current.querySelector('svg');
    const { w, h } = naturalSizeRef.current;
    if (svgEl && w > 0 && h > 0) {
      svgEl.setAttribute('width', String(Math.round(w * zoomRef.current)));
      svgEl.setAttribute('height', String(Math.round(h * zoomRef.current)));
    }
  }, []);

  const changeZoom = useCallback(
    (delta) => {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomRef.current + delta));
      zoomRef.current = next;
      setZoom(next);
      applyTransform();
    },
    [applyTransform]
  );

  /** Resets to the initial fit-to-canvas scale and zeroes pan. */
  const resetView = useCallback(() => {
    const canvas = canvasRef.current;
    const { w } = naturalSizeRef.current;
    if (canvas && w > 0) {
      const available = canvas.clientWidth - 32; // minus padding
      const fitScale = w > available ? available / w : 1;
      zoomRef.current = fitScale;
      setZoom(fitScale);
    } else {
      zoomRef.current = 1;
      setZoom(1);
    }
    panRef.current = { x: 0, y: 0 };
    applyTransform();
  }, [applyTransform]);

  /* ── drag-to-pan ────────────────────────────────────────────────────────── */

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: panRef.current.x,
      originY: panRef.current.y,
    };
    e.currentTarget.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!dragRef.current.active) return;
      panRef.current = {
        x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
      };
      applyTransform();
    },
    [applyTransform]
  );

  const onMouseUp = useCallback((e) => {
    dragRef.current.active = false;
    if (e.currentTarget) e.currentTarget.style.cursor = 'grab';
  }, []);

  /* Ctrl+scroll to zoom — uses a non-passive native listener so preventDefault works.
   * Plain scroll (no Ctrl) is intentionally ignored so the page can still scroll. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // let page scroll normally
      e.preventDefault();
      changeZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [changeZoom]);

  /* ── mermaid render ─────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    const mermaidTheme = resolvedTheme === 'dark' ? 'dark' : 'default';

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'inherit',
      fontSize: DIAGRAM_FONT_SIZE,
      flowchart: { htmlLabels: true, curve: 'basis', fontSize: DIAGRAM_FONT_SIZE },
      sequence: { useMaxWidth: true, fontSize: DIAGRAM_FONT_SIZE },
      classDiagram: { fontSize: DIAGRAM_FONT_SIZE },
      er: { fontSize: DIAGRAM_FONT_SIZE },
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
          // Inject a <style> into the SVG to enforce font size.
          // Mermaid v11 ignores the fontSize config for certain diagram types,
          // so post-processing the SVG string is the only reliable approach.
          const fontStyle = `<style>
            text, .label, .nodeLabel, .edgeLabel, .cluster-label,
            .node text, .edgeTerminals text { font-size: ${DIAGRAM_FONT_SIZE}px !important; }
          </style>`;
          const styledSvg = svg.replace(/(<svg[^>]*>)/, `$1${fontStyle}`);

          containerRef.current.innerHTML = styledSvg;
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            // Parse the natural viewBox dimensions for attribute-based zoom
            const vb = svgEl
              .getAttribute('viewBox')
              ?.trim()
              .split(/[\s,]+/);
            let nw = 0,
              nh = 0;
            if (vb?.length >= 4) {
              nw = parseFloat(vb[2]);
              nh = parseFloat(vb[3]);
            }
            if (!nw) nw = parseFloat(svgEl.getAttribute('width') || '0') || 600;
            if (!nh) nh = parseFloat(svgEl.getAttribute('height') || '0') || 400;
            naturalSizeRef.current = { w: nw, h: nh };

            // Compute initial fit scale — fill canvas width if diagram is wider, else 1:1
            const canvas = canvasRef.current;
            const available = canvas ? canvas.clientWidth - 32 : 600;
            const fitScale = nw > available ? available / nw : 1;

            // Clear any inline styles Mermaid may have set; sizing is now via attributes
            svgEl.removeAttribute('style');
            svgEl.style.display = 'block';

            zoomRef.current = fitScale;
            panRef.current = { x: 0, y: 0 };
            setZoom(fitScale);
            applyTransform();
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
  }, [chart, mermaidId, resolvedTheme, applyTransform]);

  const zoomPct = Math.round(zoom * 100);

  return (
    <figure className="mermaid-figure my-6 w-full">
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

      {/* Diagram wrapper */}
      {!error && (
        <div
          className="mermaid-wrapper rounded-lg border border-border/60 bg-card"
          style={{ display: isLoading ? 'none' : undefined }}
        >
          {/* ── Toolbar ── */}
          <div className="mermaid-toolbar">
            <span className="mermaid-toolbar-hint">Ctrl+scroll to zoom · drag to pan</span>
            <div className="mermaid-toolbar-controls">
              {/* Zoom out */}
              <button
                type="button"
                onClick={() => changeZoom(-ZOOM_STEP)}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Zoom out"
                title="Zoom out"
                className="mermaid-btn"
                id={`${mermaidId}-zoom-out`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M6.25 9a.75.75 0 01.75-.75h4a.75.75 0 010 1.5H7A.75.75 0 016.25 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Zoom % readout / click to reset */}
              <button
                type="button"
                onClick={resetView}
                aria-label={`Current zoom ${zoomPct}%. Click to reset`}
                title="Reset zoom & pan"
                className="mermaid-zoom-label"
                id={`${mermaidId}-zoom-reset`}
              >
                {zoomPct}%
              </button>

              {/* Zoom in */}
              <button
                type="button"
                onClick={() => changeZoom(ZOOM_STEP)}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Zoom in"
                title="Zoom in"
                className="mermaid-btn"
                id={`${mermaidId}-zoom-in`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M9 6.25a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5H6.75a.75.75 0 010-1.5h1.5V7A.75.75 0 019 6.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset view"
                title="Reset zoom & pan"
                className="mermaid-btn"
                id={`${mermaidId}-reset`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.26-3.853a.75.75 0 00.219-.53V2.799a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.27 8.158a.75.75 0 101.449.389A5.5 5.5 0 0113.052 4.05l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219l-.131-.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Pan/Zoom canvas ── */}
          <div
            ref={canvasRef}
            className="mermaid-canvas"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            role="img"
            aria-label="Mermaid diagram — Ctrl+scroll to zoom, drag to pan"
          >
            {/* Container: panned via translate; SVG inside is zoomed via attribute resize */}
            <div ref={containerRef} className="mermaid-container" />
          </div>
        </div>
      )}
    </figure>
  );
}
