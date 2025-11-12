'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Residuo, Solicitud } from '@/types/database.types';
import StatsCard from '@/components/ui/StatsCard';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { formatDate, getStatusColor, getStatusName } from '@/lib/utils/helpers';

interface ProductorDashboardProps {
  profile: Profile;
}

export default function ProductorDashboard({ profile }: ProductorDashboardProps) {
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [stats, setStats] = useState({
    totalResiduos: 0,
    residuosDisponibles: 0,
    solicitudesPendientes: 0,
    entregasCompletadas: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '',
    cantidad_kg: '',
    descripcion: '',
    fecha_generacion: new Date().toISOString().split('T')[0],
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar residuos
    const { data: residuosData } = await supabase
      .from('residuos')
      .select('*')
      .eq('productor_id', profile.id)
      .order('created_at', { ascending: false });

    if (residuosData) {
      setResiduos(residuosData);
      setStats((prev) => ({
        ...prev,
        totalResiduos: residuosData.reduce((sum, r: any) => sum + Number(r.cantidad_kg), 0),
        residuosDisponibles: residuosData.filter((r: any) => r.disponible).length,
      }));
    }

    // Cargar solicitudes
    const { data: solicitudesData } = await supabase
      .from('solicitudes')
      .select('*, solicitante:solicitante_id(nombre, rol), residuo:residuo_id(tipo, cantidad_kg)')
      .eq('productor_id', profile.id)
      .order('created_at', { ascending: false });

    if (solicitudesData) {
      setSolicitudes(solicitudesData as any);
      setStats((prev) => ({
        ...prev,
        solicitudesPendientes: solicitudesData.filter((s: any) => s.status === 'pendiente').length,
        entregasCompletadas: solicitudesData.filter((s: any) => s.status === 'completada').length,
      }));
    }
  };

  const handleCreateResiduo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('residuos').insert({
        productor_id: profile.id,
        tipo: formData.tipo,
        cantidad_kg: Number(formData.cantidad_kg),
        descripcion: formData.descripcion,
        fecha_generacion: formData.fecha_generacion,
        disponible: true,
      } as any);

      if (!error) {
        setIsModalOpen(false);
        setFormData({
          tipo: '',
          cantidad_kg: '',
          descripcion: '',
          fecha_generacion: new Date().toISOString().split('T')[0],
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSolicitud = async (solicitudId: string, status: 'aceptada' | 'rechazada') => {
    const { error } = await (supabase as any)
      .from('solicitudes')
      .update({ status })
      .eq('id', solicitudId);

    if (!error) {
      loadData();
    }
  };

  const residuosColumns = [
    { header: 'Tipo', accessor: 'tipo' },
    {
      header: 'Cantidad (kg)',
      accessor: 'cantidad_kg',
      cell: (value: number) => value.toFixed(2),
    },
    {
      header: 'Fecha Generación',
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
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: Solicitud) =>
        row.status === 'pendiente' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateSolicitud(value, 'aceptada')}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              Aceptar
            </button>
            <button
              onClick={() => handleUpdateSolicitud(value, 'rechazada')}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Rechazar
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Productor</h1>
        <p className="text-gray-600 mt-2">Gestiona tus residuos orgánicos y solicitudes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Residuos"
          value={`${stats.totalResiduos} kg`}
          icon={Package}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Disponibles"
          value={stats.residuosDisponibles}
          icon={CheckCircle}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Solicitudes Pendientes"
          value={stats.solicitudesPendientes}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatsCard
          title="Entregas Completadas"
          value={stats.entregasCompletadas}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Residuos */}
      <Card
        title="Mis Residuos"
        description="Registro de residuos orgánicos generados"
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo Residuo
          </button>
        }
      >
        <Table columns={residuosColumns} data={residuos} emptyMessage="No hay residuos registrados" />
      </Card>

      {/* Solicitudes */}
      <Card title="Solicitudes Recibidas" description="Gestiona las solicitudes de recicladores y gestores">
        <Table
          columns={solicitudesColumns}
          data={solicitudes}
          emptyMessage="No hay solicitudes"
        />
      </Card>

      {/* Modal para crear residuo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Residuo">
        <form onSubmit={handleCreateResiduo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Residuo</label>
            <input
              type="text"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Ej: Cáscaras de frutas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad (kg)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cantidad_kg}
              onChange={(e) => setFormData({ ...formData, cantidad_kg: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Generación</label>
            <input
              type="date"
              value={formData.fecha_generacion}
              onChange={(e) => setFormData({ ...formData, fecha_generacion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              rows={3}
              placeholder="Información adicional sobre el residuo"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
