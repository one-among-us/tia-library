'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Search from './Search'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const [railCollapsed, setRailCollapsed] = useState<boolean | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const restoreFocus = useRef(false)

  // Opening moves focus into the drawer; closing by Escape or the backdrop hands it back to ☰.
  useEffect(() => {
    if (isMobileNavOpen) {
      restoreFocus.current = true
      drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    } else if (restoreFocus.current) {
      restoreFocus.current = false
      toggleRef.current?.focus()
    }
  }, [isMobileNavOpen])

  // The drawer closes on any navigation; focus stays where the new page put it.
  useEffect(() => { restoreFocus.current = false; setMobileNavOpen(false) }, [pathname])

  useEffect(() => {
    if (!isMobileNavOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMobileNavOpen])

  useEffect(() => {
    setRailCollapsed(document.documentElement.dataset.rail === 'collapsed')
  }, [])

  const toggleRail = () => {
    const next = !(railCollapsed ?? document.documentElement.dataset.rail === 'collapsed')
    setRailCollapsed(next)
    const root = document.documentElement
    if (next) root.dataset.rail = 'collapsed'
    else delete root.dataset.rail
    try { localStorage.setItem('tia-library-rail', next ? 'collapsed' : 'open') } catch {}
  }

  return (
    <div className="site-root">
      <header className="site-header">
        <Link className="brand" href="/">
          <img className="brand-logo theme-logo-light" src="/LOGO.webp" alt="Trans in Academia!" />
          <img className="brand-logo theme-logo-dark" src="/LOGO_Dark.webp" alt="" aria-hidden="true" />
          <span>Library</span>
        </Link>
        <div className="site-tools">
          <Search />
          <ThemeToggle />
          <button
            className="rail-toggle"
            type="button"
            aria-expanded={railCollapsed !== true}
            aria-controls="site-sidebar"
            title={railCollapsed ? '展开目录' : '收起目录'}
            onClick={toggleRail}
          >
            <span className="sr-only">{railCollapsed ? '展开' : '收起'}目录</span>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3.5h12v11H3zM8 3.5v11" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
          <button
            ref={toggleRef}
            className="mobile-nav-toggle"
            type="button"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-sidebar"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span className="sr-only">{isMobileNavOpen ? '关闭' : '打开'}导航</span>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 5.5h16M1 12.5h16" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
        </div>
      </header>
      <div className="site-body">
        <aside id="site-sidebar" className="site-sidebar">{sidebar}</aside>
        <div className="site-main">{children}</div>
      </div>
      {isMobileNavOpen && (
        <>
          <button
            className="mobile-nav-backdrop"
            type="button"
            aria-label="关闭导航"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside ref={drawerRef} id="mobile-sidebar" className="mobile-sidebar" aria-label="移动端主导航">
            {sidebar}
          </aside>
        </>
      )}
      <footer className="site-footer">
        <span>© Trans in Academia!</span>
        <a href="https://github.com/transinacademia/tia-library" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </div>
  )
}
