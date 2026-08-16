'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/common/copy-button';

/**
 * CodeBlock — styled code block wrapper with copy button and language label.
 *
 * Wraps the `<pre>` output from rehype-pretty-code and adds:
 * - A floating copy button
 * - Language label in the top-right corner
 * - Proper styling for Shiki output
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
export function CodeBlock({ className, children, ...props }) {
  const preRef = useRef(null);
  const [codeText, setCodeText] = useState('');

  // Extract language from data attributes or child code element
  const codeChild = children?.props;
  const language = codeChild?.['data-language'] || '';

  // Extract text content after mount via effect (avoids ref access during render)
  const updateCodeText = useCallback(() => {
    if (preRef.current) {
      setCodeText(preRef.current.textContent || '');
    }
  }, []);

  useEffect(() => {
    updateCodeText();
  }, [updateCodeText]);

  return (
    <div
      className={cn(
        'group relative my-6 w-full min-w-0 border border-border/60',
        language ? 'rounded-lg' : 'rounded-lg'
      )}
    >
      {/* Language label */}
      {language && (
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2 rounded-t-lg">
          <span className="text-xs font-medium text-muted-foreground">{language}</span>
        </div>
      )}

      {/* Copy button */}
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {language && <div className="h-8" />}
        <CopyButton
          text={codeText}
          className="bg-background/80 shadow-sm backdrop-blur-sm border border-border/40"
        />
      </div>

      {/* Code content — scrolls horizontally, never expands past parent */}
      <pre
        ref={preRef}
        className={cn(
          'w-full overflow-x-auto p-4 text-sm leading-relaxed',
          language ? 'rounded-b-lg' : 'rounded-lg',
          className
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
