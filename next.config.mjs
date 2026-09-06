import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/zh', destination: '/docs', permanent: true },
      { source: '/zh/docs', destination: '/docs', permanent: true },
      { source: '/zh/docs/:path*', destination: '/docs/:path*', permanent: true },
    ];
  },
};

export default withMDX(config);
