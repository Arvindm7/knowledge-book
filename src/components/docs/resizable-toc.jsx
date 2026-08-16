'use client';

import { ResizeHandle, useResizableWidth } from '@/components/layout/resize-handle';
import { TableOfContents } from './table-of-contents';

const TOC_DEFAULT_WIDTH = 192; // 12rem = w-48
const TOC_MIN_WIDTH = 140;
const TOC_MAX_WIDTH = 320;

/**
 * ResizableToc — wraps the Table of Contents with a drag-to-resize handle.
 *
 * Only visible on xl+ screens (matching the existing TOC breakpoint).
 * The resize handle appears on the left edge of the TOC panel.
 *
 * @param {object} props
 * @param {Array<{ id: string, text: string, level: number }>} props.headings
 * @returns {React.ReactElement | null}
 */
export function ResizableToc({ headings }) {
  const [tocWidth, setTocWidth] = useResizableWidth(TOC_DEFAULT_WIDTH, 'docs-toc-width');

  if (!headings || headings.length === 0) return null;

  return (
    <>
      <ResizeHandle
        side="right"
        defaultWidth={TOC_DEFAULT_WIDTH}
        minWidth={TOC_MIN_WIDTH}
        maxWidth={TOC_MAX_WIDTH}
        storageKey="docs-toc-width"
        onResize={setTocWidth}
        className="hidden xl:flex"
      />
      <aside
        className="sticky top-20 hidden shrink-0 xl:block"
        style={{ width: tocWidth, maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto' }}
      >
        <TableOfContents headings={headings} />
      </aside>
    </>
  );
}
