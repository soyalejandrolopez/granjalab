'use client';

import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate, getRoleName } from '@/lib/utils/helpers';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    productores: 0,
    recicladores: 0,
    gestores: 0,
    admins: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsuarios(data);
      setStats({
        productores: data.filter((u: any) => u.rol === 'productor').length,
        recicladores: data.filter((u: any) => u.rol === 'reciclador').length,
        gestores: data.filter((u: any) => u.rol === 'gestor').length,
        admins: data.filter((u: any) => u.rol === 'admin').length,
      });
    }
  };

  const filteredUsuarios = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Rol',
      accessor: 'rol',
      cell: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
          {getRoleName(value)}
        </span>
      ),
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
      cell: (value: string) => value || '-',
    },
    {
      header: 'Dirección',
      accessor: 'direccion',
      cell: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      header: 'Registro',
      accessor: 'created_at',
      cell: (value: string) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra todos los usuarios de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Productores"
          value={stats.productores}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Recicladores"
          value={stats.recicladores}
          icon={Users}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Gestores"
          value={stats.gestores}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon={Users}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <Card
        title={`Usuarios (${filteredUsuarios.length})`}
        description="Todos los usuarios registrados en la plataforma"
      >
        <Table
          columns={columns}
          data={filteredUsuarios}
          emptyMessage="No hay usuarios"
        />
      </Card>
    </div>
  );
}
