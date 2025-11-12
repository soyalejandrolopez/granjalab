'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Solicitud } from '@/types/database.types';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate, getStatusColor, getStatusName } from '@/lib/utils/helpers';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [stats, setStats] = useState({
    pendientes: 0,
    aceptadas: 0,
    rechazadas: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadSolicitudes();
    }
  }, [userId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const loadSolicitudes = async () => {
    const { data } = await supabase
      .from('solicitudes')
      .select('*, solicitante:solicitante_id(nombre, rol), residuo:residuo_id(tipo, cantidad_kg)')
      .eq('productor_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setSolicitudes(data as any);
      setStats({
        pendientes: data.filter((s: any) => s.status === 'pendiente').length,
        aceptadas: data.filter((s: any) => s.status === 'aceptada').length,
        rechazadas: data.filter((s: any) => s.status === 'rechazada').length,
      });
    }
  };

  const handleUpdateStatus = async (solicitudId: string, status: 'aceptada' | 'rechazada') => {
    const updateData: any = { status };
    // @ts-ignore
    await supabase
      .from('solicitudes')
      .update(updateData)
      .eq('id', solicitudId);
    loadSolicitudes();
  };

  const columns = [
    {
      header: 'Solicitante',
      accessor: 'solicitante',
      cell: (value: any) => (
        <div>
          <div className="font-medium">{value?.nombre || 'N/A'}</div>
          <div className="text-xs text-gray-500 capitalize">{value?.rol || ''}</div>
        </div>
      ),
    },
    {
      header: 'Residuo',
      accessor: 'residuo',
      cell: (value: any) => (
        <div>
          <div>{value?.tipo || 'N/A'}</div>
          <div className="text-xs text-gray-500">{value?.cantidad_kg ? `${value.cantidad_kg} kg` : ''}</div>
        </div>
      ),
    },
    {
      header: 'Mensaje',
      accessor: 'mensaje',
      cell: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      header: 'Fecha',
      accessor: 'created_at',
      cell: (value: string) => formatDate(value),
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
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: Solicitud) =>
        row.status === 'pendiente' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(value, 'aceptada')}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              Aceptar
            </button>
            <button
              onClick={() => handleUpdateStatus(value, 'rechazada')}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Rechazar
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitudes Recibidas</h1>
        <p className="text-gray-600 mt-2">Gestiona las solicitudes de recicladores y gestores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatsCard
          title="Aceptadas"
          value={stats.aceptadas}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Rechazadas"
          value={stats.rechazadas}
          icon={XCircle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Table */}
      <Card title="Listado de Solicitudes" description="Todas las solicitudes recibidas">
        <Table
          columns={columns}
          data={solicitudes}
          emptyMessage="No hay solicitudes"
        />
      </Card>
    </div>
  );
}
