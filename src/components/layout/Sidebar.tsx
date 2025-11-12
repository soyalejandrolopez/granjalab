'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
  User,
  Search,
  Menu,
  X,
  CheckSquare,
} from 'lucide-react';
import { Profile, UserRole } from '@/types/database.types';
import { cn } from '@/lib/utils/helpers';

interface SidebarProps {
  profile: Profile;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: 'dashboard',
    icon: LayoutDashboard,
    roles: ['productor', 'reciclador', 'gestor', 'admin'],
  },
  {
    name: 'Mis Residuos',
    href: 'residuos',
    icon: Package,
    roles: ['productor'],
  },
  {
    name: 'Solicitudes Recibidas',
    href: 'solicitudes',
    icon: FileText,
    roles: ['productor'],
  },
  {
    name: 'Residuos Disponibles',
    href: 'buscar',
    icon: Search,
    roles: ['reciclador', 'gestor'],
  },
  {
    name: 'Mis Solicitudes',
    href: 'mis-solicitudes',
    icon: CheckSquare,
    roles: ['reciclador', 'gestor'],
  },
  {
    name: 'Usuarios',
    href: 'usuarios',
    icon: Users,
    roles: ['admin'],
  },
  {
    name: 'Residuos',
    href: 'residuos',
    icon: Package,
    roles: ['admin'],
  },
  {
    name: 'Solicitudes',
    href: 'solicitudes',
    icon: FileText,
    roles: ['admin'],
  },
  {
    name: 'Estadísticas',
    href: 'estadisticas',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    name: 'Mi Perfil',
    href: 'perfil',
    icon: User,
    roles: ['productor', 'reciclador', 'gestor', 'admin'],
  },
];

export default function Sidebar({ profile }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(profile.rol)
  );

  const isActive = (href: string) => {
    const basePath = `/${profile.rol}`;
    const fullPath = href === 'dashboard' ? basePath : `${basePath}/${href}`;
    return pathname === fullPath;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between lg:justify-center">
          <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const href = item.href === 'dashboard' ? `/${profile.rol}` : `/${profile.rol}/${item.href}`;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                active
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  active ? 'text-green-600' : 'text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{profile.nombre}</p>
          <p className="text-xs text-gray-600 mt-1">{profile.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
