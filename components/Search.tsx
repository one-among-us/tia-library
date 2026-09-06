'use client'

import React, { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import type { FuseResultMatch } from 'fuse.js'
import { twemojifyText, TwemojiText } from './Twemoji'

type Entry = { href: string; title: string; heading?: string; section: string; headings: string[]; excerpt: string }
// [start, end) — Fuse reports an inclusive end, converted on the way in.
type Range = [number, number]
type Snippet = { text: string; ranges: Range[] }
type Hit = { entry: Entry; titleRanges: Range[]; snippet: Snippet | null }

// Both files are fetched on intent, never on mount, and cached for the page lifetime.
// search-index.json is small (titles, headings, an excerpt); search-text.json holds the
// plain bodies and is only pulled once someone has actually typed a query.
let indexPromise: Promise<Entry[]> | null = null
let textPromise: Promise<Record<string, string>> | null = null
const loadIndex = () =>
  (indexPromise ??= fetch('/search-index.json').then((r) => r.json() as Promise<Entry[]>).catch(() => { indexPromise = null; return [] }))
const loadText = () =>
  (textPromise ??= fetch('/search-text.json').then((r) => r.json() as Promise<Record<string, string>>).catch(() => { textPromise = null; return {} }))

// Fuzzy recall is Fuse's job; ranking stays ours. Fuse scores every exact match 0, so an
// exact excerpt would tie with an exact title — the field tiers below keep the intended
// order, and Fuse's own score only orders fuzzy matches within one tier.
const FIELD_KEYS = [
  { name: 'title', weight: 3 },
  { name: 'heading', weight: 2 },
  { name: 'headings', weight: 1.5 },
  { name: 'excerpt', weight: 1 },
]
const TIER_OF: Record<string, number> = { title: 4, heading: 3, headings: 2, excerpt: 1 }
const FUSE_THRESHOLD = 0.3
const FUSE_OPTIONS = {
  includeScore: true,
  includeMatches: true,
  // CJK matches sit anywhere in a long string; the default location/distance window
  // would discard them.
  ignoreLocation: true,
  threshold: FUSE_THRESHOLD,
}

// Fuse tolerates floor(THRESHOLD * len) errors (calibrated: score = errors / len), and a
// match with e errors still keeps e+1 exact runs of at least ⌈(len-e)/(e+1)⌉ characters.
// One of those runs must therefore appear verbatim, so a body containing none of the
// query's runs can be skipped without losing a match — see the body pass below.
const exactRuns = (q: string): string[] => {
  const chars = [...q]
  const errors = Math.floor(FUSE_THRESHOLD * chars.length)
  const run = Math.ceil((chars.length - errors) / (errors + 1))
  return [...new Set(chars.map((_, i) => chars.slice(i, i + run).join('')).slice(0, chars.length - run + 1))]
}

// A body hit that needs no Fuse: at threshold 0.3 a query of up to 3 characters can only
// match exactly, and indexOf finds those a hundred times faster. Indices are reported in
// Fuse's inclusive-end shape so hitOf treats both alike.
function exactBodyMatch(body: string, q: string): FuseResultMatch | null {
  const i = body.indexOf(q)
  return i < 0 ? null : { key: 'body', value: q, indices: [[i, i + q.length - 1]] }
}

const toRanges = (m: FuseResultMatch): Range[] => (m.indices ?? []).map(([s, e]) => [s, e + 1] as Range)

const mergeRanges = (ranges: Range[]): Range[] => {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])
  const out: Range[] = []
  for (const [s, e] of sorted) {
    const last = out[out.length - 1]
    if (last && s <= last[1]) last[1] = Math.max(last[1], e)
    else out.push([s, e])
  }
  return out
}

// The sentence around the first match, trimmed at 。！？ or a line break where one is near.
// Match ranges are clipped into the window and re-offset so <mark> survives the trimming.
function snippetOf(text: string, ranges: Range[], before = 24, after = 48): Snippet | null {
  if (!text || !ranges.length) return null
  const [s, e] = ranges[0]
  const lo = Math.max(0, s - before)
  const hi = Math.min(text.length, e + after)
  const cut = Math.max(...['。', '！', '？', '\n'].map((c) => text.lastIndexOf(c, s)))
  const start = cut >= lo ? cut + 1 : lo
  const rel = text.slice(e, hi).search(/[。！？\n]/)
  const end = rel === -1 ? hi : e + rel + 1
  const slice = text.slice(start, end)
  const lead = slice.length - slice.trimStart().length
  const prefix = start === lo && lo > 0 ? '…' : ''
  const suffix = end === hi && hi < text.length ? '…' : ''
  return {
    text: prefix + slice.trim() + suffix,
    ranges: mergeRanges(
      ranges
        .map(([a, b]) => [Math.max(a, start), Math.min(b, end)] as Range)
        .filter(([a, b]) => b > a)
        .map(([a, b]) => [a - start - lead + prefix.length, b - start - lead + prefix.length] as Range)
    ),
  }
}

function hitOf(item: Entry, matches: readonly FuseResultMatch[], body?: string): Hit {
  const byKey = (key: string) => matches.filter((m) => m.key === key)
  const titleRanges = mergeRanges(byKey('title').flatMap(toRanges))
  let snippet: Snippet | null = null
  for (const key of ['heading', 'headings', 'excerpt', 'body']) {
    const ms = byKey(key)
    if (!ms.length) continue
    // For the headings array Fuse reports the matched element as value, with its array
    // position in refIndex.
    const source =
      key === 'body' ? body ?? ''
      : key === 'headings' ? ms[0].value ?? item.headings[ms[0].refIndex ?? 0] ?? ''
      : key === 'heading' ? item.heading ?? ''
      : item.excerpt
    snippet = snippetOf(source, mergeRanges(ms.flatMap(toRanges)))
    if (snippet) break
  }
  return { entry: item, titleRanges, snippet }
}

function Mark({ text, ranges }: { text: string; ranges: Range[] }) {
  if (!ranges.length) return <>{twemojifyText(text)}</>
  const parts: React.ReactNode[] = []
  let pos = 0
  for (const [s, e] of ranges) {
    if (s > pos) parts.push(twemojifyText(text.slice(pos, s)))
    parts.push(<mark key={s}>{twemojifyText(text.slice(s, e))}</mark>)
    pos = e
  }
  if (pos < text.length) parts.push(twemojifyText(text.slice(pos)))
  return <>{parts}</>
}

export default function Search() {
  const router = useRouter()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<Entry[] | null>(null)
  const [text, setText] = useState<Record<string, string> | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const deferred = useDeferredValue(query)
  const q = deferred.trim()

  const fieldFuse = useMemo(() => (index ? new Fuse(index, { ...FUSE_OPTIONS, keys: FIELD_KEYS }) : null), [index])
  // Bodies lowercased once so the prefilter's includes() is case-insensitive like Fuse;
  // lowercasing keeps the length, so Fuse's match indices still line up with the original.
  const bodyText = useMemo(
    () => (text ? Object.fromEntries(Object.entries(text).map(([href, body]) => [href, body.toLowerCase()])) : null),
    [text]
  )

  const hits = useMemo(() => {
    if (!q || !fieldFuse) return []
    const found = fieldFuse
      .search(q)
      .map(({ item, matches = [], score = 0 }) => ({
        hit: hitOf(item, matches),
        sort: Math.max(0, ...matches.map((m) => TIER_OF[m.key ?? ''] ?? 0)) - score,
      }))
      .sort((a, b) => b.sort - a.sort)
      .slice(0, 12)
      .map(({ hit }) => hit)
    // Body matches only ever fill the slots the fields left open — a doc that merely
    // mentions the query must not outrank one whose title is about it. Single characters
    // reach the body pass only when the fields found nothing (every hit would be noise).
    if (index && bodyText && text && found.length < 12 && (q.length >= 2 || found.length === 0)) {
      const seen = new Set(found.map((h) => h.entry.href))
      // Exact hits first: one indexOf pass per body, stopping once the page is full.
      for (const entry of index) {
        if (found.length >= 12) break
        if (seen.has(entry.href)) continue
        const match = exactBodyMatch(bodyText[entry.href] ?? '', q)
        if (match) {
          seen.add(entry.href)
          found.push(hitOf(entry, [match], text[entry.href]))
        }
      }
      // Then Fuse for typo recall — only when exact matching left the page mostly
      // empty (a full page needs no help) and only for 4+ character queries, where a
      // fuzzy match is still possible. Fuse's bitap runs at ~0.6ms per KB, so before
      // touching it the run prefilter keeps only the docs that can still hold a match
      // within Fuse's error budget; a no-match query is usually filtered down to nothing.
      if (found.length < 5 && q.length >= 4) {
        const runs = exactRuns(q)
        const candidates = index
          .filter((e) => !seen.has(e.href) && runs.some((r) => (bodyText[e.href] ?? '').includes(r)))
          .map((e) => ({ ...e, body: bodyText[e.href] ?? '' }))
        for (const { item, matches = [] } of new Fuse(candidates, { ...FUSE_OPTIONS, keys: [{ name: 'body', weight: 1 }] }).search(q)) {
          if (found.length >= 12) break
          if (seen.has(item.href)) continue
          seen.add(item.href)
          found.push(hitOf(item, matches, text[item.href]))
        }
      }
    }
    return found
  }, [fieldFuse, index, bodyText, q])
  const showSheet = open && q.length > 0

  const ensureIndex = () => { if (!index) loadIndex().then(setIndex) }
  useEffect(() => { if (q && !text) loadText().then(setText) }, [q, text])
  useEffect(() => { setActive(0) }, [q])

  // "/" (when not typing) and ⌘K / Ctrl+K focus the field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if ((e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        loadIndex().then(setIndex)
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (showSheet) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, showSheet, listId])

  const go = (href: string) => {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Pinyin and other IMEs send Enter/arrows while composing; those belong to the IME.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); if (hits.length) setActive((a) => (a + 1) % hits.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hits.length) setActive((a) => (a - 1 + hits.length) % hits.length) }
    else if (e.key === 'Enter') { const h = hits[active] ?? hits[0]; if (h) { e.preventDefault(); go(h.entry.href) } }
    else if (e.key === 'Escape') { if (showSheet) { e.preventDefault(); setOpen(false) } else { setQuery(''); inputRef.current?.blur() } }
  }

  return (
    <div
      className="search"
      role="search"
      ref={rootRef}
      data-has-query={query ? 'true' : undefined}
      onBlur={(e) => { if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false) }}
    >
      <div className="search-field">
        <label htmlFor="site-search" className="sr-only">搜索资料库</label>
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="搜索资料库"
          role="combobox"
          aria-expanded={showSheet}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showSheet && hits[active] ? `${listId}-${active}` : undefined}
          value={query}
          onFocus={() => { ensureIndex(); setOpen(true) }}
          onPointerEnter={ensureIndex}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="sr-only" aria-live="polite">
        {showSheet ? (index ? `${hits.length} 条结果` : '正在载入') : ''}
      </div>
      {showSheet && (
        <ul id={listId} className="search-sheet" role="listbox" aria-label="搜索结果" onMouseDown={(e) => e.preventDefault()}>
          {index === null && <li className="search-status">正在载入…</li>}
          {index !== null && hits.length === 0 && (
            bodyText
              ? <li className="search-status">没有找到「{q}」</li>
              : <li className="search-status">正在检索全文…</li>
          )}
          {hits.map((h, i) => (
            <li
              key={h.entry.href}
              id={`${listId}-${i}`}
              className="search-result"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
            >
              <Link
                href={h.entry.href}
                tabIndex={-1}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                  e.preventDefault()
                  go(h.entry.href)
                }}
              >
                {h.entry.section && <span className="search-result-section"><TwemojiText text={h.entry.section} /></span>}
                <span className="search-result-title"><Mark text={h.entry.title} ranges={h.titleRanges} /></span>
                {h.snippet && <span className="search-result-snippet"><Mark text={h.snippet.text} ranges={h.snippet.ranges} /></span>}
              </Link>
            </li>
          ))}
          {index !== null && hits.length > 0 && !text && <li className="search-status">正在载入全文…</li>}
        </ul>
      )}
    </div>
  )
}
