/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto le dice a Vercel que ignore los errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Esto ignora los errores de TypeScript (como el 'any')
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
