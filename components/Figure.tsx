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
      <img src={src} alt={alt || caption || ''} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
