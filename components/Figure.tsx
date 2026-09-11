import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

export default function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt?: string;
  caption?: string;
}) {
  return (
    <figure>
      <ImageZoom>
        <img src={src} alt={alt || caption || ''} />
      </ImageZoom>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
