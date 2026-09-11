export default function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video"
        className="absolute inset-0 h-full w-full"
        allowFullScreen
      />
    </div>
  );
}
