import React from 'react'
import { notFound } from 'next/navigation'
import { allDocs } from 'contentlayer/generated'
import DocRenderer, { headingsFromMarkdown, titleUnits } from '../../../components/DocRenderer'
import TOC from '../../../components/TOC'
import EditThisPageLink from '../../../components/EditThisPageLink'
import { TwemojiText } from '../../../components/Twemoji'

export function generateStaticParams() {
  return [{ lang: 'zh' }]
}

export default function DocsIndexPage({ params }: { params: { lang: string } }) {
  const doc = allDocs.find((candidate) => candidate.slug === '_index' || candidate.slug === 'docs/_index')
  if (!doc) notFound()
  const heading = doc.heading || doc.title
  return (
    <main className="doc-page">
      <div className="doc-content">
        <p className="eyebrow">Trans in Academia! Library</p>
        <h1 style={{ '--title-w': titleUnits(heading) } as React.CSSProperties}><TwemojiText text={heading} /></h1>
        <DocRenderer code={doc.body.code} />
        <EditThisPageLink filePath={`content.zh/${doc._raw.sourceFilePath}`} />
      </div>
      <TOC items={headingsFromMarkdown(doc.body.raw)} />
    </main>
  )
}
