import { siteConfig } from '@/config/site';
import { getDocsNavigationTree } from '@/services/docs';
import { PageLayout } from '@/components/layout';

export const metadata = {
  title: {
    default: 'Documentation',
    template: `%s — ${siteConfig.name} Docs`,
  },
  description: `Documentation for ${siteConfig.name}`,
};

/**
 * Docs Layout — wraps all /docs routes.
 *
 * Fetches the navigation tree once at the layout level (shared across
 * all doc pages) and passes it to the PageLayout's Sidebar.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export default async function DocsLayout({ children }) {
  let navItems = [];

  try {
    navItems = await getDocsNavigationTree();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[docs] Failed to fetch navigation tree:', error.message);
  }

  return (
    <PageLayout showSidebar={true} wide={true} navItems={navItems}>
      {children}
    </PageLayout>
  );
}
