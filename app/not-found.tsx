import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-24">
        <p className="text-fd-primary mb-2 text-sm font-semibold">404</p>
        <h1 className="mb-3 text-3xl font-bold">页面不存在</h1>
        <p className="text-fd-muted-foreground mb-6 leading-relaxed">
          这个地址没有对应的页面，它可能已被移动、重命名或删除。
        </p>
        <p>
          <Link href="/docs">返回资料库首页</Link>
        </p>
      </main>
    </HomeLayout>
  );
}
