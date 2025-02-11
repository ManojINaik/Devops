/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/devathon' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/devathon/' : '',
}

module.exports = nextConfig
