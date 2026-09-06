import { defineDocs } from 'fumadocs-mdx/macro';
import { frontmatterSchema } from 'fumadocs-mdx/config';
import { loader } from 'fumadocs-core/source';
import { z } from 'zod';

const docs = defineDocs({
  dir: 'content.zh/docs',
  docs: {
    schema: frontmatterSchema.extend({
      heading: z.string().optional(),
      date: z.union([z.string(), z.date()]).optional(),
    }),
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
