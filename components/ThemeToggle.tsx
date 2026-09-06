'use client'

import React, { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'tia-library-theme'

function effective(): Theme {
  const stamped = document.documentElement.dataset.theme
  if (stamped === 'light' || stamped === 'dark') return stamped
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setTheme(effective())
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const toggle = () => {
    const next: Theme = effective() === 'dark' ? 'light' : 'dark'
    const commit = () => {
      document.documentElement.dataset.theme = next
      try { localStorage.setItem(KEY, next) } catch {}
      setTheme(next)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready?: Promise<void> } | void }
    if (!reduce && typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(commit)
      if (transition && transition.ready) transition.ready.catch(() => {})
    } else commit()
  }

  const dark = theme === 'dark'
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={dark ? '切换为浅色' : '切换为深色'}
      aria-pressed={dark}
      title={dark ? '切换为浅色' : '切换为深色'}
      onClick={toggle}
    >
      <svg className="theme-icon-light" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="2.75" />
        <path d="M8 1.5v1.75M8 12.75v1.75M1.5 8h1.75M12.75 8h1.75M3.4 3.4l1.24 1.24M11.36 11.36l1.24 1.24M3.4 12.6l1.24-1.24M11.36 4.64l1.24-1.24" />
      </svg>
      <svg className="theme-icon-dark" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1z" />
      </svg>
    </button>
  )
}
