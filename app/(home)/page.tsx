import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16 md:py-24">
      <img
        src="/LOGO.webp"
        alt="Trans in Academia!"
        className="mb-6 h-auto w-36 dark:hidden md:w-40"
      />
      <img
        src="/LOGO_Dark.webp"
        alt=""
        aria-hidden="true"
        className="mb-6 hidden h-auto w-36 dark:block md:w-40"
      />
      <p className="text-fd-primary mb-2 text-sm font-semibold tracking-wide">
        Trans in Academia!
      </p>
      <h1 className="text-fd-foreground mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
        跨性别学术小组资料库
      </h1>
      <p className="text-fd-muted-foreground max-w-xl text-lg leading-relaxed">
        这里收录跨性别学术小组的写作、翻译与研究资料，欢迎阅读、引用和分享。
      </p>
      <div className="mt-8 mb-16 flex flex-wrap gap-3">
        <Link
          href="/docs"
          className="bg-fd-primary text-fd-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium no-underline"
        >
          浏览资料库
        </Link>
        <a
          href="https://transinacademia.org/"
          target="_blank"
          rel="noreferrer"
          className="bg-fd-secondary text-fd-secondary-foreground rounded-md px-4 py-2.5 text-sm font-medium no-underline"
        >
          访问小组主页
        </a>
      </div>
      <section
        className="border-fd-border max-w-xl border-t pt-8"
        aria-labelledby="submission-heading"
      >
        <h2 id="submission-heading" className="mb-3 text-xl font-semibold">
          投稿与参与
        </h2>
        <p className="text-fd-muted-foreground mb-3 leading-relaxed">
          如果您有意投稿，请将作品发送至{' '}
          <a href="mailto:tia@proton.me">tia@proton.me</a>
          ，并附上联系方式、作品出处和转载格式等信息。审核通过后，我们会尽快与您联系，并将作品上传至资料库的对应板块。
        </p>
        <p>
          <Link href="/docs/about">了解更多关于我们</Link>
        </p>
      </section>
    </main>
  );
}
