import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import type { Translations } from 'fumadocs-ui/i18n';

export const translations: Partial<Translations> = {
  'Search(search trigger)': '搜索',
  'Search(search dialog)': '搜索',
  'No results found(search dialog)': '没有找到结果',
  'Close Search(search dialog)(aria-label)': '关闭搜索',
  'Open Search(search trigger)(aria-label)': '打开搜索',
  'Edit on GitHub(edit page)': '在 GitHub 上编辑',
  'Last updated on(page footer)': '最后更新于',
  'On this page(table of contents)': '本页目录',
  'No Headings(table of contents)': '没有标题',
  'Next Page(pagination)': '下一页',
  'Previous Page(pagination)': '上一页',
  'Copy Markdown(page actions)': '复制 Markdown',
  'View as Markdown(page actions)': '以 Markdown 查看',
  'Open in GitHub(page actions)': '在 GitHub 中打开',
  'Open(page actions)': '打开',
  'Show Sidebar(sidebar)': '显示侧边栏',
  'Hide Sidebar(sidebar)': '隐藏侧边栏',
  'Copy Text(code block)(aria-label)': '复制',
  'Copied Text(code block)(aria-label)': '已复制',
  'Toggle Theme(theme switcher)(aria-label)': '切换主题',
  'Light(theme switcher)(aria-label)': '浅色',
  'Dark(theme switcher)(aria-label)': '深色',
  'System(theme switcher)(aria-label)': '跟随系统',
  'Table of Contents(inline table of contents)': '目录',
  'Open Sidebar(sidebar)(aria-label)': '打开侧边栏',
  'Close Sidebar(sidebar)(aria-label)': '关闭侧边栏',
  'Collapse Sidebar(sidebar)(aria-label)': '折叠侧边栏',
  'Toggle Menu(mobile menu)(aria-label)': '打开菜单',
};

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
