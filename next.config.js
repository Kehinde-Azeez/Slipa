/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Puppeteer and pg must run server-side only — not bundled for client or edge
  // NOTE: Next.js 15 renames this to `serverExternalPackages`
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'pg', 'bcryptjs'],
  },
}

module.exports = nextConfig
