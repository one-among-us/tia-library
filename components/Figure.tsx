import React from 'react'
import { twemojifyText } from './Twemoji'

export default function Figure({ src, alt, caption }: { src: string, alt?: string, caption?: string }) {
  return (
    <figure>
      <img src={src} alt={alt || ''} style={{maxWidth: '100%'}} />
      {caption && <figcaption>{twemojifyText(caption)}</figcaption>}
    </figure>
  )
}
