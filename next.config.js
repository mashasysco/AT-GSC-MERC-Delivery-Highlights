/** @type {import('next').NextConfig} */
const nextConfig = {
      output: "standalone",
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
}
module.exports = nextConfig