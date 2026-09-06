'use client'

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TwemojiText } from './Twemoji'

export type NavNode = { title: string; href: string; children: NavNode[] }

const HOME: NavNode = { title: '首页', href: '/zh/docs', children: [] }
const within = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)
// Labels past this length may be clamped to two lines, so they carry the full text as a tooltip.
const LONG = 20

export default function SidebarTree({ tree }: { tree: NavNode[] }) {
  // Next 14 returns the percent-encoded path; the tree's hrefs are raw Unicode.
  const rawPathname = usePathname()
  const pathname = useMemo(() => { try { return decodeURI(rawPathname) } catch { return rawPathname } }, [rawPathname])
  const uid = useId()
  const navRef = useRef<HTMLElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  // A navigation forgets only the toggles on the chain above the new page, so what the
  // reader collapsed elsewhere stays collapsed.
  useEffect(() => {
    setOverrides((o) => {
      const next = { ...o }
      for (const href of Object.keys(next)) if (within(pathname, href)) delete next[href]
      return next
    })
  }, [pathname])

  // The active cursor is one element on the rail's right edge, positioned by measurement.
  // A ResizeObserver on the nav re-measures while a group unfolds or the rail resizes.
  useEffect(() => {
    const nav = navRef.current
    const cursor = cursorRef.current
    if (!nav || !cursor) return
    const place = () => {
      const row = nav.querySelector<HTMLElement>('.nav-row.is-active')
      if (!row || row.closest('.nav-group[data-open="false"]')) { cursor.dataset.ready = 'false'; return }
      const r = row.getBoundingClientRect()
      const n = nav.getBoundingClientRect()
      cursor.style.setProperty('--cursor-top', `${r.top - n.top}px`)
      cursor.style.setProperty('--cursor-h', `${r.height}`)
      cursor.dataset.ready = 'true'
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(nav)
    return () => ro.disconnect()
  }, [pathname, overrides])

  // Bring the current page into the rail's upper third if it is out of view.
  // The rail scrolls; the page never does.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const nav = navRef.current
      const row = nav?.querySelector<HTMLElement>('.nav-row.is-active')
      const rail = nav?.closest<HTMLElement>('.site-sidebar, .mobile-sidebar')
      if (!row || !rail) return
      const r = row.getBoundingClientRect()
      const s = rail.getBoundingClientRect()
      if (r.top < s.top || r.bottom > s.bottom) rail.scrollTop += r.top - s.top - s.height / 3
    }, 240)
    return () => window.clearTimeout(id)
  }, [pathname])

  const isOpen = (node: NavNode, depth: number) =>
    overrides[node.href] ?? (depth === 1 || within(pathname, node.href))

  const renderNodes = (nodes: NavNode[], depth: number): React.ReactNode =>
    nodes.map((node) => {
      const active = pathname === node.href
      const section = node.children.length > 0
      const open = section && isOpen(node, depth)
      const groupId = `${uid}-${node.href.replace(/[^\w-]+/g, '-')}`
      return (
        <li key={node.href} data-depth={depth}>
          <div className={active ? 'nav-row is-active' : 'nav-row'}>
            <Link
              className="nav-link"
              href={node.href}
              data-kind={section ? 'section' : 'article'}
              aria-current={active ? 'page' : undefined}
              title={[...node.title].length > LONG ? node.title : undefined}
              style={{ '--depth': depth } as React.CSSProperties}
            >
              <span className="nav-text"><TwemojiText text={node.title} /></span>
            </Link>
            {section && (
              <button
                type="button"
                className="nav-toggle"
                aria-expanded={open}
                aria-controls={groupId}
                aria-label={`${open ? '收起' : '展开'}${node.title}`}
                onClick={() => setOverrides((o) => ({ ...o, [node.href]: !open }))}
              />
            )}
          </div>
          {section && (
            <div className="nav-group" id={groupId} data-open={open}>
              <ul>{renderNodes(node.children, depth + 1)}</ul>
            </div>
          )}
        </li>
      )
    })

  return (
    <nav ref={navRef} className="nav" aria-label="主导航">
      <span ref={cursorRef} className="nav-cursor" aria-hidden="true" />
      <ul>
        {renderNodes([HOME], 1)}
        {renderNodes(tree, 1)}
      </ul>
    </nav>
  )
}
