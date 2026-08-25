import { PageLayout } from '@/components/layout';
import { HomeContent } from '@/components/home';
import { getDocsNavigationTree, findFirstPageInDir } from '@/services/docs';
import { hasLocalContent, getLocalMetadata, getLocalBuildInfo } from '@/services/content';

/**
 * Gathers homepage data from the content manifests or navigation tree.
 * Returns categories and aggregate statistics.
 * Recently-read pages are tracked client-side via localStorage (useRecentlyRead hook).
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

    // Total reading time (from metadata if available, else estimate)
    let totalReadingMinutes = 0;
    if (hasLocalContent()) {
      const metadata = getLocalMetadata();
      const metaEntries = Object.values(metadata);
      if (metaEntries.length > 0) {
        totalReadingMinutes = metaEntries.reduce((sum, m) => sum + (m.readingTimeMinutes || 0), 0);
      }
    }

    // Get last sync timestamp from build info
    let lastSynced = null;
    const buildInfo = getLocalBuildInfo();
    if (buildInfo?.generatedAt) {
      lastSynced = buildInfo.generatedAt;
    }

    return {
      categories,
      stats: {
        totalPages: allPages.length,
        totalCategories: categories.length,
        totalReadingHours:
          totalReadingMinutes > 0
            ? Math.round(totalReadingMinutes / 60)
            : Math.round((allPages.length * 5) / 60),
        lastSynced,
      },
    };
  } catch {
    // Fallback for empty/unreachable content
    return {
      categories: [],
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
  const { categories, stats } = await getHomePageData();

  return (
    <PageLayout showSidebar={false}>
      <HomeContent categories={categories} stats={stats} />
    </PageLayout>
  );
}
