'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types/database.types';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'productor' as UserRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      // Crear usuario en Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            rol: formData.rol,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Verificar si el usuario fue confirmado automáticamente
        const session = data.session;

        if (session) {
          // Usuario confirmado automáticamente, esperar a que se cree el perfil
          let retries = 0;
          const maxRetries = 5;

          while (retries < maxRetries) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('rol')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              // Perfil encontrado, redirigir al dashboard
              router.push(`/${formData.rol}`);
              return;
            }

            // Esperar 500ms antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
          }

          // Si después de reintentos no se encontró el perfil, redirigir igualmente
          router.push(`/${formData.rol}`);
        } else {
          // Usuario requiere confirmación de email
          setError('Por favor, revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Error al crear la cuenta');
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: 'productor',
      label: 'Productor',
      description: 'Genero residuos orgánicos (restaurantes, mercados)',
    },
    {
      value: 'reciclador',
      label: 'Reciclador',
      description: 'Proceso y transformo residuos orgánicos',
    },
    {
      value: 'gestor',
      label: 'Gestor',
      description: 'Gestiono y utilizo residuos (granjas, compostaje)',
    },
  ];

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

      <div className="flex items-center justify-center px-4 py-8 min-h-[calc(100vh-3rem)]">
        <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ReciclajeApp</h1>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
            <p className="text-sm text-gray-600">
              Únete a nuestra red de gestión de residuos orgánicos
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
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Usuario
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.rol === role.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={role.value}
                      checked={formData.rol === role.value}
                      onChange={(e) =>
                        setFormData({ ...formData, rol: e.target.value as UserRole })
                      }
                      className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{role.label}</span>
                        {formData.rol === role.value && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
                Inicia sesión
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
