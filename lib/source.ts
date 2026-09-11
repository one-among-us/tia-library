import { defineDocs } from 'fumadocs-mdx/macro';
import { frontmatterSchema } from 'fumadocs-mdx/config';
import { llms, loader } from 'fumadocs-core/source';
import { z } from 'zod';

const docs = defineDocs({
  dir: 'content.zh/docs',
  docs: {
    lastModified: true,
    schema: frontmatterSchema.extend({
      heading: z.string().optional(),
      date: z.union([z.string(), z.date()]).optional(),
    }),
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  // Next.js already decodes params; keep slugs as real Unicode so Chinese
  // filenames resolve instead of 404ing against percent-encoded keys.
  slugs(_file, next) {
    return next().map((segment) => {
      try {
        return decodeURI(segment);
      } catch {
        return segment;
      }
    });
  },
});

export const docsLlms = llms(source);

export function getPageMarkdownUrl(slugs: string[] | undefined) {
  const path = slugs?.length ? slugs.join('/') : 'index';
  return `/docs/${path}.md`;
}
