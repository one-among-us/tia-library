import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: {
    default: 'Trans in Academia! Library',
    template: '%s | Trans in Academia! Library',
  },
  description: '跨儿学术小组资料库',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          theme={{
            defaultTheme: 'system',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
