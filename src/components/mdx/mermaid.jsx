'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

/**
 * Mermaid diagram renderer with zoom / pan controls.
 *
 * Client-side component that renders Mermaid diagram syntax into SVG.
 * Automatically adapts to current light/dark theme and provides
 * zoom-in, zoom-out, and reset buttons plus mouse-drag panning.
 */

const DIAGRAM_FONT_SIZE = 14;
const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 5;

/**
 * Computes a fit scale so the diagram is never clipped on load.
 * Small diagrams stay at 1.0 (100%) and center nicely; large diagrams scale down to fit.
 */
function calculateFitScale(nw, nh, canvas) {
  if (!canvas || nw <= 0 || nh <= 0) return 1;
  const clientW = canvas.clientWidth || 600;
  const clientH = canvas.clientHeight || 420;
  const availableW = Math.max(clientW - 32, 200);
  const availableH = Math.max(clientH - 32, 200);

  // If diagram naturally fits inside canvas at 100%, keep it at 100% (do not stretch!)
  if (nw <= availableW && nh <= availableH) {
    return 1;
  }

  // Diagram is larger than canvas: scale down so it fits comfortably
  const scaleW = availableW / nw;
  const scaleH = availableH / nh;
  const fit = Math.max(ZOOM_MIN, Math.min(1, Math.min(scaleW, scaleH)));
  return Math.round(fit * 100) / 100;
}

export function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
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
  const [zoom, setZoom] = useState(1);

  /* ── helpers ────────────────────────────────────────────────────────────── */

  /**
   * Applies the current zoom and pan.
   * Zoom is applied by updating the SVG's width/height attributes and style directly,
   * so the browser re-evaluates the vector graphic at native pixel resolution.
   * Pan is applied as a CSS translate on the container div.
   */
  const applyTransform = useCallback(() => {
    if (!containerRef.current) return;
    const { x, y } = panRef.current;
    containerRef.current.style.transform = `translate(${x}px, ${y}px)`;

    const svgEl = containerRef.current.querySelector('svg');
    const { w, h } = naturalSizeRef.current;
    if (svgEl && w > 0 && h > 0) {
      const targetW = Math.max(10, Math.round(w * zoomRef.current));
      const targetH = Math.max(10, Math.round(h * zoomRef.current));
      svgEl.setAttribute('width', String(targetW));
      svgEl.setAttribute('height', String(targetH));
      svgEl.style.width = `${targetW}px`;
      svgEl.style.height = `${targetH}px`;
      svgEl.style.maxWidth = 'none';
      svgEl.style.maxHeight = 'none';
    }
  }, []);

  const changeZoom = useCallback(
    (delta) => {
      const next = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, Math.round((zoomRef.current + delta) * 100) / 100)
      );
      zoomRef.current = next;
      setZoom(next);
      applyTransform();
    },
    [applyTransform]
  );

  /** Resets to the initial fit scale and zeroes pan. */
  const resetView = useCallback(() => {
    const canvas = canvasRef.current;
    const { w, h } = naturalSizeRef.current;
    const fitScale = calculateFitScale(w, h, canvas);
    zoomRef.current = fitScale;
    panRef.current = { x: 0, y: 0 };
    setZoom(fitScale);
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

  /* Ctrl+scroll / pinch-to-zoom — native listener so preventDefault works */
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
      sequence: { useMaxWidth: false, fontSize: DIAGRAM_FONT_SIZE },
      classDiagram: { fontSize: DIAGRAM_FONT_SIZE },
      er: { fontSize: DIAGRAM_FONT_SIZE },
    });

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function renderDiagram() {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Use unique render id to avoid DOM collisions
        const renderId = `${mermaidId}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart);

        if (!cancelled && containerRef.current) {
          const fontStyle = `<style>
            text, .label, .nodeLabel, .edgeLabel, .cluster-label,
            .node text, .edgeTerminals text { font-size: ${DIAGRAM_FONT_SIZE}px !important; }
          </style>`;
          const styledSvg = svg.replace(/(<svg[^>]*>)/, `$1${fontStyle}`);

          containerRef.current.innerHTML = styledSvg;
          const svgEl = containerRef.current.querySelector('svg');

          if (svgEl) {
            // Parse natural dimensions from viewBox or attributes
            const vb = svgEl
              .getAttribute('viewBox')
              ?.trim()
              .split(/[\s,]+/);
            let nw = 0;
            let nh = 0;
            if (vb && vb.length >= 4) {
              nw = parseFloat(vb[2]);
              nh = parseFloat(vb[3]);
            }
            if (!nw || isNaN(nw)) {
              nw = parseFloat(svgEl.getAttribute('width') || '0') || 500;
            }
            if (!nh || isNaN(nh)) {
              nh = parseFloat(svgEl.getAttribute('height') || '0') || 300;
            }

            // Ensure viewBox exists for clean attribute-based vector scaling
            if (!svgEl.getAttribute('viewBox')) {
              svgEl.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
            }

            naturalSizeRef.current = { w: nw, h: nh };

            // Clear any hardcoded inline styles from Mermaid
            svgEl.removeAttribute('style');
            svgEl.style.display = 'block';

            // Calculate fit scale — fits large diagrams, keeps small diagrams at 100%
            const fitScale = calculateFitScale(nw, nh, canvasRef.current);

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

  const zoomPct = Math.max(1, Math.round(zoom * 100));

  return (
    <figure className="mermaid-figure my-6 w-full">
      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
          <p className="mb-1 text-sm font-medium text-destructive">Mermaid diagram error</p>
          <pre className="overflow-x-auto text-xs whitespace-pre-wrap text-destructive/80">
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

      {/* Diagram wrapper — always mounted so canvas clientWidth is accurate */}
      {!error && (
        <div className="mermaid-wrapper rounded-lg border border-border/60 bg-card">
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
            {/* Loading overlay inside canvas — preserves canvas geometry while rendering */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/75 backdrop-blur-[2px]">
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

            {/* Container: panned via translate; SVG inside is zoomed via crisp vector resize */}
            <div ref={containerRef} className="mermaid-container" />
          </div>
        </div>
      )}
    </figure>
  );
}
