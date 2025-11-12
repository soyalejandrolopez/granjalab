'use client';

import { useState, useEffect } from 'react';
import { Users, Package, FileText, TrendingUp, PieChart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import StatsCard from '@/components/ui/StatsCard';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { getRoleName, getStatusColor, getStatusName, formatDate } from '@/lib/utils/helpers';

interface AdminDashboardProps {
  profile: Profile;
}

export default function AdminDashboard({ profile }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalResiduos: 0,
    totalSolicitudes: 0,
    totalKgProcesados: 0,
  });
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [solicitudesRecientes, setSolicitudesRecientes] = useState<any[]>([]);
  const [residuosRecientes, setResiduosRecientes] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar usuarios
    const { data: usuariosData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usuariosData) {
      setUsuarios(usuariosData);
      setStats((prev) => ({ ...prev, totalUsuarios: usuariosData.length }));
    }

    // Cargar residuos
    const { data: residuosData } = await supabase
      .from('residuos')
      .select('*, productor:productor_id(nombre)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (residuosData) {
      setResiduosRecientes(residuosData);
      const totalKg = residuosData.reduce((sum, r: any) => sum + Number(r.cantidad_kg), 0);
      setStats((prev) => ({ ...prev, totalResiduos: residuosData.length, totalKgProcesados: totalKg }));
    }

    // Cargar solicitudes
    const { data: solicitudesData } = await supabase
      .from('solicitudes')
      .select('*, productor:productor_id(nombre), solicitante:solicitante_id(nombre), residuo:residuo_id(tipo, cantidad_kg)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (solicitudesData) {
      setSolicitudesRecientes(solicitudesData);
      setStats((prev) => ({ ...prev, totalSolicitudes: solicitudesData.length }));
    }
  };

  const usuariosColumns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Rol',
      accessor: 'rol',
      cell: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {getRoleName(value)}
        </span>
      ),
    },
    {
      header: 'Fecha Registro',
      accessor: 'created_at',
      cell: (value: string) => formatDate(value),
    },
  ];

  const residuosColumns = [
    {
      header: 'Productor',
      accessor: 'productor',
      cell: (value: any) => value?.nombre || 'N/A',
    },
    { header: 'Tipo', accessor: 'tipo' },
    {
      header: 'Cantidad (kg)',
      accessor: 'cantidad_kg',
      cell: (value: number) => value.toFixed(2),
    },
    {
      header: 'Fecha',
      accessor: 'fecha_generacion',
      cell: (value: string) => formatDate(value),
    },
    {
      header: 'Estado',
      accessor: 'disponible',
      cell: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Disponible' : 'No disponible'}
        </span>
      ),
    },
  ];

  const solicitudesColumns = [
    {
      header: 'Solicitante',
      accessor: 'solicitante',
      cell: (value: any) => value?.nombre || 'N/A',
    },
    {
      header: 'Productor',
      accessor: 'productor',
      cell: (value: any) => value?.nombre || 'N/A',
    },
    {
      header: 'Residuo',
      accessor: 'residuo',
      cell: (value: any) => `${value?.tipo} (${value?.cantidad_kg} kg)`,
    },
    {
      header: 'Estado',
      accessor: 'status',
      cell: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
          {getStatusName(value)}
        </span>
      ),
    },
    {
      header: 'Fecha',
      accessor: 'created_at',
      cell: (value: string) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Vista general de la plataforma ReciclajeApp</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Usuarios"
          value={stats.totalUsuarios}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Total Residuos"
          value={stats.totalResiduos}
          icon={Package}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Total Solicitudes"
          value={stats.totalSolicitudes}
          icon={FileText}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Kg Procesados"
          value={`${stats.totalKgProcesados.toFixed(0)} kg`}
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Usuarios */}
      <Card title="Usuarios Registrados" description="Lista de todos los usuarios de la plataforma">
        <Table columns={usuariosColumns} data={usuarios} emptyMessage="No hay usuarios" />
      </Card>

      {/* Residuos Recientes */}
      <Card title="Residuos Recientes" description="Últimos residuos registrados en la plataforma">
        <Table
          columns={residuosColumns}
          data={residuosRecientes}
          emptyMessage="No hay residuos"
        />
      </Card>

      {/* Solicitudes Recientes */}
      <Card
        title="Solicitudes Recientes"
        description="Últimas solicitudes de recolección realizadas"
      >
        <Table
          columns={solicitudesColumns}
          data={solicitudesRecientes}
          emptyMessage="No hay solicitudes"
        />
      </Card>
    </div>
  );
}
