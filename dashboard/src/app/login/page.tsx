'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSimulatorAudio } from '@/hooks/useSimulatorAudio';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@cybershield.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { playSound } = useSimulatorAudio();

  useEffect(() => {
    // Initial boot sequence sound
    playSound('beep');
  }, [playSound]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playSound('beep');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        playSound('error');
        throw new Error(data.message || 'Acceso Denegado. Credenciales Inválidas.');
      }

      playSound('success');
      login(data.access_token, data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#05050f] overflow-hidden">
      {/* ── Lado Izquierdo: Narrativa Cyberpunk ── */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative flex-col justify-end p-12 bg-cover bg-center border-r border-[#00f0ff]/30"
        style={{ backgroundImage: 'url("/login-bg.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050f] via-[#05050f]/80 to-transparent z-0" />
        <div className="absolute inset-0 bg-[#00f0ff]/10 mix-blend-overlay z-0" />
        
        <div className="relative z-10 max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <Terminal className="text-[#00f0ff] w-8 h-8" />
            <h1 className="text-4xl font-orbitron font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>
              Escudo de Monitoreo
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-lg text-cyan-100/80 font-light leading-relaxed">
              Estás intentando acceder al <strong className="text-[#00f0ff] font-medium">Centro de Comando Orbital</strong>. 
              Este sistema híbrido de protección de grado militar supervisa el tráfico de red, 
              detecta anomalías cuánticas y neutraliza amenazas persistentes avanzadas en tiempo real.
            </p>
            <div className="flex gap-4 items-center pt-4 border-t border-[#00f0ff]/20">
              <div className="h-2 w-2 rounded-full bg-[#00f0ff] animate-pulse" />
              <span className="text-xs text-[#00f0ff] font-orbitron uppercase tracking-widest">Sistema en Línea // Encriptación AES-256</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Lado Derecho: Formulario de Acceso ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-10 z-10"
        >
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center border border-[#00f0ff]/50 bg-[#00f0ff]/10 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Shield className="h-8 w-8 text-[#00f0ff]" />
            </div>
            <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider mb-2">
              AUTENTICACIÓN
            </h2>
            <p className="text-sm text-gray-400 font-sans">
              Ingrese sus credenciales operativas
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#ff003c]/10 border border-[#ff003c]/50 p-4 rounded-lg flex items-start gap-3 shadow-[0_0_15px_rgba(255,0,60,0.2)]"
              >
                <AlertCircle className="w-5 h-5 text-[#ff003c] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#ff003c] font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-orbitron text-[#00f0ff] uppercase tracking-wider mb-2" htmlFor="email">
                  Identificación (Correo)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#00f0ff] transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-lg bg-[#05050f]/80 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] transition-all"
                    placeholder="analista@cybershield.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-orbitron text-[#00f0ff] uppercase tracking-wider mb-2" htmlFor="password">
                  Código de Acceso
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00f0ff] transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-800 rounded-lg bg-[#05050f]/80 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#00f0ff] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg text-sm font-orbitron font-bold uppercase tracking-wider text-[#05050f] bg-[#00f0ff] hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f0ff] focus:ring-offset-[#05050f] transition-all overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
              <span className="relative z-10">{loading ? 'Estableciendo Conexión...' : 'Iniciar Sesión'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

