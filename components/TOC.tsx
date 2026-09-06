'use client'

import React, { useEffect, useState } from 'react'
import { TwemojiText } from './Twemoji'

type Item = { id: string; text: string }

// Marks the entry whose heading was most recently scrolled past the reading line
// (just under the sticky head). Scroll-driven, rAF-throttled, no observers to tune.
export default function TOC({ items }: { items: Item[] }) {
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    if (!items.length) return
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el)
    if (!headings.length) return

    let ticking = false
    const update = () => {
      ticking = false
      const headerH = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 48
      const line = headerH + 32
      let active: HTMLElement | null = null
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) active = h
        else break
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) active = headings[headings.length - 1]
      setCurrent(active ? active.id : null)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  // Browsers ignore a click on a fragment that is already in the URL, so a second
  // click on the same entry after scrolling away would do nothing. Scroll explicitly;
  // scroll-margin-top and the page's scroll-behavior still apply.
  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    history.pushState(null, '', `#${id}`)
    el.scrollIntoView()
    setCurrent(id)
  }

  if (!items || items.length === 0) return null
  return (
    <nav className="toc" aria-label="本文目录">
      <h2>本文目录</h2>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} onClick={(e) => jump(e, it.id)} aria-current={current === it.id ? 'location' : undefined}><TwemojiText text={it.text} /></a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
