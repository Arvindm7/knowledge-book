import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { getRemarkPlugins, getRehypePlugins } from '@/lib/mdx';
import { getMdxComponents, Mermaid } from '@/components/mdx';

/**
 * MDX Content Renderer.
 *
 * Server component that compiles and renders MDX content using
 * next-mdx-remote-client with our configured remark/rehype plugins.
 *
 * This component bridges the parsing layer (lib/mdx.js) and the
 * UI layer (components/mdx/) into a single renderable unit.
 *
 * @param {object} props
 * @param {string} props.source - Raw MDX content string (without frontmatter).
 * @returns {React.ReactElement}
 */
export async function MdxContent({ source }) {
  const components = getMdxComponents({
    Mermaid,
  });

  return (
    <div className="mdx-content prose-custom">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: getRemarkPlugins(),
            rehypePlugins: getRehypePlugins(),
          },
        }}
        components={components}
      />
    </div>
  );
}
