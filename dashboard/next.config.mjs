/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Apaga los errores amarillos y rojos de ESLint en Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Apaga los errores de TypeScript en Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
