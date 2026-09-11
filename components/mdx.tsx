import defaultMdxComponents from 'fumadocs-ui/mdx';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { MDXComponents } from 'mdx/types';
import type { ImgHTMLAttributes } from 'react';
import Figure from './Figure';
import YouTubeEmbed from './YouTubeEmbed';
import GistEmbed from './GistEmbed';
import Katex from './Katex';

function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const className = ['rounded-lg', props.className].filter(Boolean).join(' ');
  if (typeof props.className === 'string' && props.className.includes('emoji')) {
    return <img {...props} className={className} />;
  }
  return (
    <ImageZoom>
      <img {...props} className={className} />
    </ImageZoom>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: MarkdownImage,
    Figure,
    YouTubeEmbed,
    GistEmbed,
    Katex,
    ...components,
  };
}
