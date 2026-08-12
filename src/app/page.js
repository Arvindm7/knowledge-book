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
    let totalWords = 0;

    if (hasLocalContent()) {
      const metadata = getLocalMetadata();
      const metaEntries = Object.values(metadata);

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

      // Estimate total words from reading time (avg 200 wpm)
      totalWords = metaEntries.reduce((sum, m) => sum + (m.readingTimeMinutes || 0) * 200, 0);
    }

    // Get last sync timestamp from build info
    let lastSynced = null;
    const buildInfo = getLocalBuildInfo();
    if (buildInfo?.generatedAt) {
      lastSynced = buildInfo.generatedAt;
    }

    // Count total unique topics (tags) if metadata available
    let totalTopics = 0;
    if (hasLocalContent()) {
      const metadata = getLocalMetadata();
      const tagSet = new Set();
      for (const m of Object.values(metadata)) {
        if (m.tags) {
          for (const tag of m.tags) {
            tagSet.add(tag);
          }
        }
      }
      totalTopics = tagSet.size || allPages.length;
    } else {
      totalTopics = allPages.length;
    }

    return {
      categories,
      recentPages,
      stats: {
        totalPages: allPages.length,
        totalCategories: categories.length,
        totalWords: totalWords || allPages.length * 800,
        totalTopics,
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
        totalWords: 0,
        totalTopics: 0,
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
