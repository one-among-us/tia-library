import '../styles/globals.scss';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'

export const metadata = {
  title: 'Trans in Academia! Library',
  description: '跨儿学术小组资料库',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

// Runs before first paint. Only an explicit choice is stamped; with nothing stored the
// prefers-color-scheme rules in globals.scss decide, with no JS involved.
const themeInit =
  "try{var d=document.documentElement,t=localStorage.getItem('tia-library-theme');if(t==='light'||t==='dark')d.dataset.theme=t;if(localStorage.getItem('tia-library-rail')==='collapsed')d.dataset.rail='collapsed'}catch(e){}"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        {/* Sidebar is rendered here, in a server component, so its allDocs import never
            crosses into the client bundle. Layout receives the finished element. */}
        <Layout sidebar={<Sidebar />}>{children}</Layout>
      </body>
    </html>
  );
}
