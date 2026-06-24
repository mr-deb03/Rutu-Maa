/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native/Node packages that must be required at runtime, not bundled.
  serverExternalPackages: ['web-push', 'pg', '@electric-sql/pglite'],
  // Pin tracing root (this app lives in a subfolder beside the Express version).
  outputFileTracingRoot: process.cwd(),
  // Don't block production builds on lint (no ESLint config shipped here).
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
