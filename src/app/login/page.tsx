'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Credenciales incorrectas');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Obtener el perfil del usuario con reintentos
        let retries = 0;
        const maxRetries = 5;
        let profile = null;

        while (retries < maxRetries) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', data.user.id)
            .single();

          if (profileData && !profileError) {
            profile = profileData;
            break;
          }

          // Esperar 500ms antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (profile) {
          const userProfile = profile as Pick<Profile, 'rol'>;
          // Redirigir según el rol
          router.push(`/${userProfile.rol}`);
        } else {
          setError('No se pudo obtener tu perfil. Por favor, contacta al administrador.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Developer Info Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-center font-medium">
            DESARROLLADO POR ALEJANDRO LOPEZ MURILLO - UNAD - UNIVERSIDAD NACIONAL ABIERTA Y A DISTANCIA
            <span className="mx-2">|</span>
            PROTOTIPO PROYECTO DE INGENIERIA 1 ~ NOV 2025
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 min-h-[calc(100vh-3rem)]">
        <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">ReciclajeApp</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
            <p className="text-sm text-gray-600">
              Accede a tu cuenta para gestionar residuos orgánicos
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-green-600 hover:text-green-700">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
