import { Card, Cards } from 'fumadocs-ui/components/card';
import { visit, type Node } from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';

function hrefOf(node: Node) {
  if (node.type === 'page') return node.url;
  if (node.type === 'folder') return node.index?.url;
}

function getCategoryNodes(url: string): Node[] {
  const tree = source.getPageTree();
  let children: Node[] | undefined;
  visit(tree, (node) => {
    if (node.type === 'folder' && node.index?.url === url) {
      children = node.children;
      return 'break';
    }
  });
  if (!children && (url === '/docs' || url === '/docs/')) children = tree.children;
  return (children ?? []).filter((node) => node.type === 'page' || node.type === 'folder');
}

export function DocsCategory({ url }: { url: string }) {
  const nodes = getCategoryNodes(url);
  if (nodes.length === 0) return null;

  return (
    <Cards className="mt-8">
      {nodes.map((node) => {
        const href = hrefOf(node);
        if (!href) return null;
        return (
          <Card
            key={href}
            title={node.name}
            href={href}
            description={'description' in node ? node.description : undefined}
          />
        );
      })}
    </Cards>
  );
}
