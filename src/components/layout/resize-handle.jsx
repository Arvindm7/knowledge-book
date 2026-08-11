'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * ResizeHandle — a draggable divider for resizing adjacent panels.
 *
 * Features:
 * - Drag to resize with real-time visual feedback
 * - Double-click to reset to default width
 * - Width persistence via localStorage
 * - Subtle hover/active visual indicators
 * - Prevents text selection during drag
 *
 * @param {object} props
 * @param {'left' | 'right'} props.side - Which panel this handle controls.
 *   'left' means dragging right increases the panel's width (left sidebar).
 *   'right' means dragging left increases the panel's width (right sidebar).
 * @param {number} props.defaultWidth - Default panel width in pixels.
 * @param {number} [props.minWidth=180] - Minimum allowed width.
 * @param {number} [props.maxWidth=480] - Maximum allowed width.
 * @param {string} [props.storageKey] - localStorage key for persistence.
 * @param {(width: number) => void} props.onResize - Callback when width changes.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement}
 */
export function ResizeHandle({
  side,
  defaultWidth,
  minWidth = 180,
  maxWidth = 480,
  storageKey,
  onResize,
  className,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);

  // Restore persisted width on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const width = Math.min(Math.max(parseInt(saved, 10), minWidth), maxWidth);
        onResize(width);
      }
    } catch {
      // localStorage not available
    }
  }, [storageKey, minWidth, maxWidth, onResize]);

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;

      // Get current width from the element being resized
      // We'll calculate from current position
      const currentWidth = startWidthRef.current;

      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        let newWidth;

        if (side === 'left') {
          newWidth = currentWidth + deltaX;
        } else {
          newWidth = currentWidth - deltaX;
        }

        newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
        onResize(newWidth);

        if (storageKey) {
          try {
            localStorage.setItem(storageKey, String(newWidth));
          } catch {
            // localStorage not available
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [side, minWidth, maxWidth, onResize, storageKey]
  );

  // Keep startWidthRef in sync for next drag
  useEffect(() => {
    if (!isDragging && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          startWidthRef.current = parseInt(saved, 10);
        }
      } catch {
        // localStorage not available
      }
    }
  }, [isDragging, storageKey]);

  const handleDoubleClick = useCallback(() => {
    onResize(defaultWidth);
    startWidthRef.current = defaultWidth;
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(defaultWidth));
      } catch {
        // localStorage not available
      }
    }
  }, [defaultWidth, onResize, storageKey]);

  return (
    <div
      className={cn('group relative hidden w-0 lg:flex items-stretch justify-center', className)}
      style={{ zIndex: 10 }}
    >
      <button
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={cn(
          'absolute top-0 bottom-0 flex w-4 cursor-col-resize items-center justify-center',
          'transition-colors duration-150',
          side === 'left' ? '-right-2' : '-left-2'
        )}
        aria-label={`Resize ${side} panel`}
        title="Drag to resize, double-click to reset"
      >
        {/* Visible handle line */}
        <div
          className={cn(
            'h-full w-px transition-all duration-150',
            isDragging
              ? 'w-0.5 bg-primary/60'
              : 'bg-border/40 group-hover:w-0.5 group-hover:bg-primary/30'
          )}
        />
      </button>
    </div>
  );
}

/**
 * Hook to manage resizable panel width state.
 *
 * @param {number} defaultWidth - Default width in pixels.
 * @param {string} [storageKey] - localStorage key for persistence.
 * @returns {[number, (width: number) => void]}
 */
export function useResizableWidth(defaultWidth, storageKey) {
  const [width, setWidth] = useState(() => {
    if (!storageKey || typeof window === 'undefined') return defaultWidth;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return parseInt(saved, 10);
    } catch {
      // localStorage not available
    }
    return defaultWidth;
  });

  const handleResize = useCallback(
    (newWidth) => {
      setWidth(newWidth);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, String(newWidth));
        } catch {
          // localStorage not available
        }
      }
    },
    [storageKey]
  );

  return [width, handleResize];
}
