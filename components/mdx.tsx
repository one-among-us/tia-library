import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import Figure from './Figure';
import YouTubeEmbed from './YouTubeEmbed';
import GistEmbed from './GistEmbed';
import Katex from './Katex';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Figure,
    YouTubeEmbed,
    GistEmbed,
    Katex,
    ...components,
  };
}
