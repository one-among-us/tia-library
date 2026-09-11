import { getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { DocsCategory } from '@/components/DocsCategory';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

const actionClassName =
  'h-auto gap-1.5 border-0 bg-transparent p-0 text-xs font-normal text-fd-muted-foreground shadow-none hover:bg-transparent hover:text-fd-foreground';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const heading =
    'heading' in page.data && typeof page.data.heading === 'string'
      ? page.data.heading
      : page.data.title;
  const lastModified = page.data.lastModified;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <DocsTitle>{heading}</DocsTitle>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
        <DocsCategory url={page.url} />
      </DocsBody>
      <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
        <EditOnGitHub
          href={`https://github.com/transinacademia/tia-library/edit/main/content.zh/docs/${page.path}`}
          className={actionClassName}
        />
        <MarkdownCopyButton
          markdownUrl={getPageMarkdownUrl(params.slug)}
          className={actionClassName}
        />
        {lastModified ? (
          <p className="text-fd-muted-foreground ms-auto text-sm">
            最后更新于 {new Date(lastModified).toLocaleDateString('zh-CN')}
          </p>
        ) : null}
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
