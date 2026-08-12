/**
 * Central site configuration.
 * Single source of truth for metadata, navigation, and external links.
 * Used by layout components, SEO metadata, and the navigation system.
 */
export const siteConfig = Object.freeze({
  name: 'Knowledge Book',
  description:
    'A personal documentation platform for organizing and sharing knowledge. All content is powered by a dedicated GitHub knowledge-base repository.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  /** Primary navigation items displayed in the Navbar. */
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'About', href: '/about' },
  ],

  /** External links (footer, social, etc.). */
  links: {
    github: `https://github.com/${process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_REPO || 'username/knowledge-base'}`,
    knowledgeBase: process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_REPO || 'username/knowledge-base',
  },

  /** Default SEO metadata. */
  seo: {
    title: 'Knowledge Book',
    titleTemplate: '%s — Knowledge Book',
    openGraph: {
      type: 'website',
      locale: 'en_US',
    },
  },
});
