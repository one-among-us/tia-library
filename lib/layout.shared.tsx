import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function Logo() {
  return (
    <>
      <img
        src="/LOGO.webp"
        alt="Trans in Academia!"
        className="h-7 w-auto dark:hidden"
      />
      <img
        src="/LOGO_Dark.webp"
        alt=""
        aria-hidden="true"
        className="hidden h-7 w-auto dark:block"
      />
      <span className="font-medium">Library</span>
    </>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: '/',
    },
    githubUrl: 'https://github.com/transinacademia/tia-library',
    links: [
      {
        text: '资料库',
        url: '/docs',
      },
      {
        text: '小组主页',
        url: 'https://transinacademia.org/',
        external: true,
      },
    ],
  };
}
