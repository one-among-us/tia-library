import React from 'react'
import { notFound } from 'next/navigation'
import { allDocs } from 'contentlayer/generated'
import DocRenderer, { headingsFromMarkdown, titleUnits } from '../../../../components/DocRenderer'
import TOC from '../../../../components/TOC'
import EditThisPageLink from '../../../../components/EditThisPageLink'
import { TwemojiText } from '../../../../components/Twemoji'

type Props = { params: { lang: string; slug: string[] } }

export function generateStaticParams() {
  return allDocs
    .filter((doc) => doc.slug.startsWith('docs/') && doc.slug !== 'docs/_index')
    .map((doc) => {
      const path = doc.slug.slice('docs/'.length)
      return { lang: 'zh', slug: path.endsWith('/_index') ? path.slice(0, -('/_index'.length)).split('/') : path.split('/') }
    })
}

// Next hands catch-all segments percent-encoded ("%E5%8F%A3…") while Contentlayer slugs
// are raw Unicode, so six Chinese-titled files 404'd. Decode defensively: a raw segment
// passes through unchanged.
const decode = (segment: string) => { try { return decodeURIComponent(segment) } catch { return segment } }

export default function DocPage({ params }: Props) {
  const slug = (params.slug ?? []).map(decode).join('/')
  const doc = allDocs.find((candidate) =>
    candidate.slug === `docs/${slug}` || candidate.slug === `docs/${slug}/_index`
  )
  if (!doc) notFound()

  const headings = headingsFromMarkdown(doc.body.raw)
  const heading = doc.heading || doc.title
  return (
    <main className="doc-page">
      <div className="doc-content">
        <h1 style={{ '--title-w': titleUnits(heading) } as React.CSSProperties}><TwemojiText text={heading} /></h1>
        <DocRenderer code={doc.body.code} />
        <EditThisPageLink filePath={`content.zh/${doc._raw.sourceFilePath}`} />
      </div>
      <TOC items={headings} />
    </main>
  )
}
