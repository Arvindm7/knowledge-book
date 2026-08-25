import { PageLayout } from '@/components/layout';
import { HomeContent } from '@/components/home';
import { getDocsNavigationTree, findFirstPageInDir } from '@/services/docs';
import { hasLocalContent, getLocalMetadata, getLocalBuildInfo } from '@/services/content';

/**
 * Gathers homepage data from the content manifests or navigation tree.
 * Returns categories, recently updated pages, and aggregate statistics.
 */
async function getHomePageData() {
  try {
    const navTree = await getDocsNavigationTree();

    // Categories = top-level directories, with href resolved to first child page
    const categories = navTree
      .filter((node) => node.isDirectory)
      .map((node) => {
        const firstChildSlug = findFirstPageInDir(node.slug, navTree);
        return {
          ...node,
          href: firstChildSlug ? `/docs/${firstChildSlug}` : `/docs/${node.slug}`,
        };
      });

    // Flatten all pages for stats
    const allPages = [];
    function collectPages(nodes) {
      for (const node of nodes) {
        if (!node.isDirectory) {
          allPages.push(node);
        }
        if (node.children?.length > 0) {
          collectPages(node.children);
        }
      }
    }
    collectPages(navTree);

    // Get metadata for pages if available
    let recentPages = [];
    let totalReadingMinutes = 0;

    if (hasLocalContent()) {
      const metadata = getLocalMetadata();
      const metaEntries = Object.values(metadata);

      if (metaEntries.length > 0) {
        // Sort by lastUpdated for recent pages
        recentPages = metaEntries
          .filter((m) => m.lastUpdated)
          .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
          .slice(0, 5)
          .map((m) => ({
            slug: m.slug,
            title: m.title,
            description: m.description,
            readingTimeMinutes: m.readingTimeMinutes,
          }));

        // Total reading time in minutes
        totalReadingMinutes = metaEntries.reduce((sum, m) => sum + (m.readingTimeMinutes || 0), 0);
      }
    }

    // Fallback: derive recent pages from nav tree when metadata is unavailable
    if (recentPages.length === 0 && allPages.length > 0) {
      recentPages = allPages.slice(0, 5).map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description || '',
        readingTimeMinutes: null,
      }));
    }

    // Get last sync timestamp from build info
    let lastSynced = null;
    const buildInfo = getLocalBuildInfo();
    if (buildInfo?.generatedAt) {
      lastSynced = buildInfo.generatedAt;
    }

    return {
      categories,
      recentPages,
      stats: {
        totalPages: allPages.length,
        totalCategories: categories.length,
        totalReadingHours:
          totalReadingMinutes > 0
            ? Math.round(totalReadingMinutes / 60)
            : Math.round((allPages.length * 5) / 60), // rough fallback: ~5 min/page
        lastSynced,
      },
    };
  } catch {
    // Fallback for empty/unreachable content
    return {
      categories: [],
      recentPages: [],
      stats: {
        totalPages: 0,
        totalCategories: 0,
        totalReadingHours: 0,
        lastSynced: null,
      },
    };
  }
}

export default async function HomePage() {
  const { categories, recentPages, stats } = await getHomePageData();

  return (
    <PageLayout showSidebar={false}>
      <HomeContent categories={categories} recentPages={recentPages} stats={stats} />
    </PageLayout>
  );
}
