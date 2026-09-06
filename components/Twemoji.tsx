import React from 'react'

const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/'
const HAS_EMOJI = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{200D}\u{FE0F}]/u
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

function fileName(emoji: string) {
  // Twemoji drops U+FE0F from the filename unless the glyph is a ZWJ sequence.
  const raw = emoji.includes('\u200D') ? emoji : emoji.replace(/\uFE0F/g, '')
  return Array.from(raw, (ch) => ch.codePointAt(0)!.toString(16)).join('-')
}

function isEmoji(grapheme: string) {
  return /\p{Regional_Indicator}|\p{Extended_Pictographic}/u.test(grapheme)
}

export function twemojifyText(text: string): React.ReactNode {
  if (!HAS_EMOJI.test(text)) return text
  const parts: React.ReactNode[] = []
  let buf = ''
  let i = 0
  for (const { segment } of graphemes.segment(text)) {
    if (isEmoji(segment)) {
      if (buf) { parts.push(buf); buf = '' }
      parts.push(
        <img
          key={i++}
          className="emoji"
          src={`${BASE}${fileName(segment)}.svg`}
          alt={segment}
          draggable={false}
        />
      )
    } else buf += segment
  }
  if (buf) parts.push(buf)
  return parts.length === 1 ? parts[0] : parts
}

export function twemojifyNode(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') return twemojifyText(node)
  if (Array.isArray(node)) return React.Children.map(node, twemojifyNode)
  return node
}

export function TwemojiText({ text }: { text: string }) {
  return <>{twemojifyText(text)}</>
}
