/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow the XAMPP bridge (port 80) and the Arena preview proxy to reach the dev server.
  allowedDevOrigins: ['*'],
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
