export default function GistEmbed({ id }: { id: string }) {
  return (
    <p>
      <a href={`https://gist.github.com/${id}`} target="_blank" rel="noreferrer">
        GitHub Gist: {id}
      </a>
    </p>
  );
}
