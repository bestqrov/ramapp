/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    optimizeFonts: false,
    output: 'export',
    distDir: 'dist',
    images: {
        unoptimized: true,
        domains: ['localhost'],
    },
    trailingSlash: true,
    // Remove rewrites for static export - API calls will be handled by absolute URLs
}

module.exports = nextConfig
