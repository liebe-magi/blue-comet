/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
