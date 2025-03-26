/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/api/docs/:path*',
      },
    ];
  },
};

export default nextConfig;
