'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import { getRoleName } from '@/lib/utils/helpers';

interface NavbarProps {
  profile: Profile;
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
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

      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${profile.rol}`} className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <span className="text-lg font-bold text-gray-900">ReciclajeApp</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{profile.nombre}</div>
                  <div className="text-xs text-gray-600">{getRoleName(profile.rol)}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
