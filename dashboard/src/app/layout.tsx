import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CyberShield — Centro de Monitoreo de Ciberseguridad",
  description:
    "Sistema híbrido de protección y monitoreo de ciberseguridad en tiempo real. Monitoreo de amenazas, análisis de riesgos y respuesta a incidentes.",
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#0a0a1a] text-gray-100 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
