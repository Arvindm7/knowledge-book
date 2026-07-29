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
    <div className="group relative my-6">
      {/* Language label */}
      {language && (
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border/60 bg-muted/40 px-4 py-2">
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

      {/* Code content */}
      <pre
        ref={preRef}
        className={cn(
          'overflow-x-auto border border-border/60 p-4 text-sm leading-relaxed',
          language ? 'rounded-b-lg rounded-t-none border-t-0' : 'rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
