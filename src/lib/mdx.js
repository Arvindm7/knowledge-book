/**
 * MDX Processing Utilities.
 *
 * Centralized configuration for the remark/rehype plugin pipeline.
 * This module is the single source of truth for how Markdown/MDX
 * is compiled into renderable content.
 *
 * Keeps all parsing logic separate from UI components.
 */

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';

// ---------------------------------------------------------------------------
// Custom Rehype Plugin: Mermaid
// ---------------------------------------------------------------------------

/**
 * rehypeMermaid — intercepts ```mermaid code blocks before rehype-pretty-code
 * and replaces them with a <Mermaid chart="..." /> MDX JSX element so the
 * client-side Mermaid component can render the SVG diagram.
 */
function rehypeMermaid() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // We're looking for: <pre><code class="language-mermaid">...</code></pre>
      if (node.tagName !== 'pre') return;

      const codeNode = node.children?.find(
        (child) =>
          child.type === 'element' &&
          child.tagName === 'code' &&
          child.properties?.className?.includes('language-mermaid')
      );

      if (!codeNode) return;

      // Extract the raw text content
      const chart = codeNode.children
        ?.filter((c) => c.type === 'text')
        .map((c) => c.value)
        .join('')
        .trim();

      if (!chart) return;

      // Replace the <pre> node with a MDX JSX element: <Mermaid chart="..." />
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'chart',
            value: chart,
          },
        ],
        children: [],
        data: { _mdxExplicitJsx: true },
      };
    });
  };
}

// ---------------------------------------------------------------------------
// Custom Rehype Plugin: GitHub-style Alerts
// ---------------------------------------------------------------------------

const ALERT_LABEL_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/i;

/**
 * rehypeAlerts — converts blockquotes that start with [!NOTE] / [!TIP] / etc.
 * into <Callout type="note"> MDX JSX elements so our Callout component renders them.
 *
 * Operates on the HAST (HTML AST) after remark has finished, which means
 * the detection is 100% reliable regardless of how React serialises children.
 *
 * Supported syntax (GitHub-flavored Markdown alerts):
 *   > [!NOTE]
 *   > Content here
 *
 *   > [!NOTE] Content inline
 */
function rehypeAlerts() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'blockquote') return;
      if (index == null || !parent) return;

      const bqChildren = node.children ?? [];

      // Find first element child that is a <p>
      const firstPIdx = bqChildren.findIndex((c) => c.type === 'element' && c.tagName === 'p');
      if (firstPIdx === -1) return;

      const firstP = bqChildren[firstPIdx];
      const firstPChildren = firstP.children ?? [];

      // The very first child of the <p> must be a text node starting with [!TYPE]
      const firstText = firstPChildren[0];
      if (!firstText || firstText.type !== 'text') return;

      const match = firstText.value.match(ALERT_LABEL_RE);
      if (!match) return;

      const type = match[1].toLowerCase(); // 'note' | 'tip' | etc.
      const afterLabel = firstText.value.slice(match[0].length);

      // Rebuild the first paragraph without the [!TYPE] label
      let newFirstPChildren;
      if (afterLabel.length > 0) {
        // Label was inline: > [!NOTE] Content → keep "Content" text node
        newFirstPChildren = [{ ...firstText, value: afterLabel }, ...firstPChildren.slice(1)];
      } else {
        // Label was alone on its line: > [!NOTE] (rest of paragraph children follow)
        newFirstPChildren = firstPChildren.slice(1);
      }

      // Rebuild the blockquote children list
      let newBqChildren;
      if (newFirstPChildren.length === 0) {
        // First paragraph only contained the label — remove it entirely
        newBqChildren = bqChildren.filter((_, i) => i !== firstPIdx);
      } else {
        newBqChildren = bqChildren.map((child, i) =>
          i === firstPIdx ? { ...firstP, children: newFirstPChildren } : child
        );
      }

      // Replace blockquote with <Callout type="..."> MDX JSX element
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Callout',
        attributes: [{ type: 'mdxJsxAttribute', name: 'type', value: type }],
        children: newBqChildren,
        data: { _mdxExplicitJsx: true },
      };
    });
  };
}

// ---------------------------------------------------------------------------
// Plugin Configuration
// ---------------------------------------------------------------------------

/**
 * Options for rehype-pretty-code (Shiki-powered syntax highlighting).
 * Uses a bundled theme for zero-config setup.
 */
const prettyCodeOptions = {
  theme: {
    dark: 'github-dark-dimmed',
    light: 'github-light',
  },
  keepBackground: false,
  defaultLang: 'plaintext',
};

/**
 * Options for rehype-autolink-headings.
 * Adds anchor links to headings for deep-linking.
 */
const autolinkHeadingsOptions = {
  behavior: 'wrap',
  properties: {
    className: ['anchor-link'],
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the configured remark plugins array.
 * Order matters: plugins run in sequence.
 *
 * @returns {Array} Remark plugins with their options.
 */
export function getRemarkPlugins() {
  return [
    remarkGfm, // Tables, strikethrough, task lists, autolinks
    remarkMath, // Math syntax ($..$ and $$..$$)
  ];
}

/**
 * Returns the configured rehype plugins array.
 * Order matters: slug must run before autolink-headings.
 *
 * @returns {Array} Rehype plugins with their options.
 */
export function getRehypePlugins() {
  return [
    rehypeSlug, // Add `id` attributes to headings
    [rehypeAutolinkHeadings, autolinkHeadingsOptions], // Wrap headings in anchor links
    rehypeKatex, // Render math as KaTeX HTML
    rehypeMermaid, // Convert ```mermaid blocks → <Mermaid chart="..." /> BEFORE syntax highlighting
    rehypeAlerts, // Convert > [!NOTE] blockquotes → <Callout type="note"> BEFORE syntax highlighting
    [rehypePrettyCode, prettyCodeOptions], // Shiki syntax highlighting (skips mermaid blocks)
  ];
}

/**
 * Extracts heading data from raw markdown content for TOC generation.
 * Parses heading lines (## Heading) and returns structured data.
 *
 * This is done via regex rather than the AST to avoid needing
 * to compile the MDX just for TOC extraction.
 *
 * @param {string} rawContent - Raw markdown string.
 * @returns {Array<{ id: string, text: string, level: number }>}
 */
export function extractHeadings(rawContent) {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(rawContent)) !== null) {
    const level = match[1].length;
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, '$1') // strip bold
      .replace(/`(.+?)`/g, '$1') // strip inline code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // strip links
      .trim();

    // Generate slug matching rehype-slug behavior
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    headings.push({ id, text, level });
  }

  return headings;
}
