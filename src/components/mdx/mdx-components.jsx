import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ImageViewer } from '@/components/common/image-viewer';
import { CodeBlock } from './code-block';

/**
 * Custom MDX component overrides.
 *
 * Maps standard HTML elements emitted by the MDX compiler to
 * styled React components. Designed for Stripe/Vercel-level
 * typography and readability.
 */

function Heading({ level, className, children, id, ...props }) {
  const Tag = `h${level}`;
  const sizes = {
    1: 'text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4',
    2: 'text-2xl font-semibold tracking-tight mt-12 mb-4 pb-2 border-b border-border/60',
    3: 'text-xl font-semibold tracking-tight mt-8 mb-3',
    4: 'text-base font-semibold tracking-tight mt-6 mb-2',
  };

  return (
    <Tag
      id={id}
      className={cn(sizes[level] || sizes[4], 'scroll-mt-20 text-foreground', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Returns the component map for MDXRemote.
 *
 * @param {object} [customComponents={}] - Additional custom components.
 * @returns {Record<string, React.ComponentType>}
 */
export function getMdxComponents(customComponents = {}) {
  return {
    // ---- Headings ----
    h1: (props) => <Heading level={1} {...props} />,
    h2: (props) => <Heading level={2} {...props} />,
    h3: (props) => <Heading level={3} {...props} />,
    h4: (props) => <Heading level={4} {...props} />,

    // ---- Paragraph ----
    p: ({ className, ...props }) => (
      <p
        className={cn('leading-7 text-foreground/90 [&:not(:first-child)]:mt-4', className)}
        {...props}
      />
    ),

    // ---- Links ----
    a: ({ className, href, children, ...props }) => {
      const isExternal = href?.startsWith('http');
      if (isExternal) {
        return (
          <a
            href={href}
            className={cn(
              'font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary/70 transition-colors',
              className
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
            <svg
              className="ml-0.5 inline-block h-3 w-3 align-baseline"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        );
      }
      return (
        <Link
          href={href || '#'}
          className={cn(
            'font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary/70 transition-colors',
            className
          )}
          {...props}
        >
          {children}
        </Link>
      );
    },

    // ---- Lists ----
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          'my-4 ml-6 list-disc space-y-2 text-foreground/90 marker:text-muted-foreground/50',
          className
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          'my-4 ml-6 list-decimal space-y-2 text-foreground/90 marker:text-muted-foreground/50',
          className
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => <li className={cn('leading-7 pl-1', className)} {...props} />,

    // ---- Blockquote ----
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          'my-6 border-l-[3px] border-primary/40 bg-muted/30 py-3 pl-5 pr-4 text-foreground/80 [&>p]:mt-0',
          className
        )}
        {...props}
      />
    ),

    // ---- Horizontal rule ----
    hr: ({ ...props }) => <hr className="my-10 border-border/60" {...props} />,

    // ---- Table ----
    table: ({ className, ...props }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
        <table className={cn('w-full text-sm', className)} {...props} />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn('bg-muted/40', className)} {...props} />
    ),
    tbody: (props) => <tbody className="divide-y divide-border/50" {...props} />,
    tr: ({ className, ...props }) => (
      <tr className={cn('transition-colors hover:bg-muted/20', className)} {...props} />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td className={cn('px-4 py-3 text-foreground/90', className)} {...props} />
    ),

    // ---- Code ----
    pre: (props) => <CodeBlock {...props} />,
    code: ({ className, children, ...props }) => {
      const isInline = !className?.includes('language-');
      if (isInline) {
        return (
          <code
            className={cn(
              'rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[0.85em] font-mono text-foreground',
              className
            )}
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={cn('font-mono text-[0.85em]', className)} {...props}>
          {children}
        </code>
      );
    },

    // ---- Image ----
    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      return <ImageViewer src={src} alt={alt || ''} caption={alt} {...props} />;
    },

    // ---- Strong & Emphasis ----
    strong: ({ className, ...props }) => (
      <strong className={cn('font-semibold text-foreground', className)} {...props} />
    ),
    em: ({ className, ...props }) => <em className={cn('italic', className)} {...props} />,

    // Merge any custom components
    ...customComponents,
  };
}
