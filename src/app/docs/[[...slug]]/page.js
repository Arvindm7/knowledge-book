import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocSlugs } from '@/services/docs';
import { extractHeadings } from '@/lib/mdx';
import { MdxContent } from '@/components/docs/mdx-content';
import { TableOfContents } from '@/components/docs/table-of-contents';
import { Breadcrumbs } from '@/components/docs/breadcrumbs';
import { DocPagination } from '@/components/docs/doc-pagination';
import { DocMeta } from '@/components/docs/doc-meta';

/**
 * Allow pages not in generateStaticParams to be rendered dynamically.
 * This means new content added between builds still works.
 */
export const dynamicParams = true;

/**
 * Pre-generates all doc page routes at build time.
 * Uses the routes manifest produced by scripts/generate-content.mjs.
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllDocSlugs();
    return slugs.map((slug) => ({
      slug: slug ? slug.split('/') : [],
    }));
  } catch {
    // If content isn't available yet (dev mode without local content), return empty
    return [];
  }
}

/**
 * Generates metadata for each doc page based on frontmatter.
 */
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug?.join('/') || '';

    const doc = await getDocBySlug(slug);
    if (!doc) {
      return { title: slug ? 'Not Found' : 'Documentation' };
    }

    return {
      title: doc.title,
      description: doc.description || `${doc.title} documentation`,
    };
  } catch {
    return { title: 'Documentation' };
  }
}

/**
 * Catch-all documentation page.
 *
 * Handles both `/docs` (root index) and `/docs/any/nested/path`.
 * Renders MDX content with full documentation chrome:
 * breadcrumbs, metadata, TOC, pagination.
 */
export default async function DocPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join('/') || '';

  let doc = null;
  try {
    doc = await getDocBySlug(slug);
  } catch {
    // Content source not available — show empty state for root, 404 for sub-pages
  }

  // If no doc found and this is a sub-page, show 404
  if (!doc && slug) {
    notFound();
  }

  // Root /docs with no content — show welcome state
  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-4">
          <svg
            className="h-10 w-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome to the Docs
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          No documentation content is connected yet. Connect your{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">knowledge-base</code>{' '}
          repository to get started.
        </p>
        <div className="rounded-xl border border-border bg-card p-6 text-left max-w-lg w-full">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Quick Setup</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Create a GitHub repo with your markdown files</li>
            <li>
              Set{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                NEXT_PUBLIC_KNOWLEDGE_BASE_REPO=username/repo
              </code>{' '}
              in <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">.env.local</code>
            </li>
            <li>
              Set{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">GITHUB_TOKEN</code>{' '}
              for API access
            </li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      </div>
    );
  }

  const headings = extractHeadings(doc.rawContent);

  return (
    <div className="flex gap-10">
      {/* Main content column */}
      <article className="min-w-0 flex-1" data-pagefind-body>
        {/* Hidden metadata for Pagefind indexing */}
        {doc.frontmatter.tags?.length > 0 && (
          <span data-pagefind-meta={`tags:${doc.frontmatter.tags.join(', ')}`} className="hidden" />
        )}

        {/* Breadcrumbs */}
        <Breadcrumbs items={doc.breadcrumbs} />

        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {doc.title}
          </h1>

          {doc.description && (
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{doc.description}</p>
          )}

          {/* Metadata bar */}
          <DocMeta
            readingTime={doc.readingTimeMinutes}
            lastUpdated={doc.lastUpdated}
            difficulty={doc.frontmatter.difficulty}
            tags={doc.frontmatter.tags}
            className="mt-4"
          />
        </header>

        {/* Separator */}
        <hr className="mb-8 border-border/50" />

        {/* MDX content */}
        <MdxContent source={doc.rawContent} />

        {/* Pagination */}
        <DocPagination prev={doc.prev} next={doc.next} />
      </article>

      {/* Table of Contents — desktop right rail */}
      {headings.length > 0 && (
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-20">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}
    </div>
  );
}
