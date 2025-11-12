'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Residuo, Solicitud } from '@/types/database.types';
import StatsCard from '@/components/ui/StatsCard';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { formatDate, getStatusColor, getStatusName } from '@/lib/utils/helpers';

interface RecicladorDashboardProps {
  profile: Profile;
}

export default function RecicladorDashboard({ profile }: RecicladorDashboardProps) {
  const [residuosDisponibles, setResiduosDisponibles] = useState<Residuo[]>([]);
  const [misSolicitudes, setMisSolicitudes] = useState<Solicitud[]>([]);
  const [stats, setStats] = useState({
    solicitudesPendientes: 0,
    solicitudesAceptadas: 0,
    totalProcesado: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResiduo, setSelectedResiduo] = useState<Residuo | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar residuos disponibles
    const { data: residuosData } = await supabase
      .from('residuos')
      .select('*, productor:productor_id(nombre, direccion, telefono)')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (residuosData) {
      setResiduosDisponibles(residuosData as any);
    }

    // Cargar mis solicitudes
    const { data: solicitudesData } = await supabase
      .from('solicitudes')
      .select('*, productor:productor_id(nombre), residuo:residuo_id(tipo, cantidad_kg)')
      .eq('solicitante_id', profile.id)
      .order('created_at', { ascending: false });

    if (solicitudesData) {
      setMisSolicitudes(solicitudesData as any);
      setStats({
        solicitudesPendientes: solicitudesData.filter((s: any) => s.status === 'pendiente').length,
        solicitudesAceptadas: solicitudesData.filter((s: any) => s.status === 'aceptada').length,
        totalProcesado: solicitudesData
          .filter((s: any) => s.status === 'completada')
          .reduce((sum, s: any) => sum + Number(s.residuo?.cantidad_kg || 0), 0),
      });
    }
  };

  const handleSolicitarResiduo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResiduo) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('solicitudes').insert({
        residuo_id: selectedResiduo.id,
        solicitante_id: profile.id,
        productor_id: selectedResiduo.productor_id,
        status: 'pendiente',
        mensaje,
      } as any);

      if (!error) {
        setIsModalOpen(false);
        setSelectedResiduo(null);
        setMensaje('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSolicitudModal = (residuo: Residuo) => {
    setSelectedResiduo(residuo);
    setIsModalOpen(true);
  };

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
      header: 'Acciones',
      accessor: 'id',
      cell: (_: string, row: Residuo) => (
        <button
          onClick={() => openSolicitudModal(row)}
          className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
        >
          Solicitar
        </button>
      ),
    },
  ];

  const solicitudesColumns = [
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
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de {profile.rol === 'reciclador' ? 'Reciclador' : 'Gestor'}
        </h1>
        <p className="text-gray-600 mt-2">Busca residuos disponibles y gestiona tus solicitudes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Solicitudes Pendientes"
          value={stats.solicitudesPendientes}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatsCard
          title="Solicitudes Aceptadas"
          value={stats.solicitudesAceptadas}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Total Procesado"
          value={`${stats.totalProcesado} kg`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
      </div>

      {/* Residuos Disponibles */}
      <Card
        title="Residuos Disponibles"
        description="Residuos orgánicos disponibles para recolección"
      >
        <Table
          columns={residuosColumns}
          data={residuosDisponibles}
          emptyMessage="No hay residuos disponibles"
        />
      </Card>

      {/* Mis Solicitudes */}
      <Card title="Mis Solicitudes" description="Historial de solicitudes realizadas">
        <Table
          columns={solicitudesColumns}
          data={misSolicitudes}
          emptyMessage="No has realizado solicitudes"
        />
      </Card>

      {/* Modal para solicitar residuo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResiduo(null);
          setMensaje('');
        }}
        title="Solicitar Residuo"
      >
        {selectedResiduo && (
          <form onSubmit={handleSolicitarResiduo} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Tipo:</span>
                <span className="text-sm text-gray-900 ml-2">{selectedResiduo.tipo}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {selectedResiduo.cantidad_kg} kg
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Productor:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {(selectedResiduo as any).productor?.nombre}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje (Opcional)
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                rows={3}
                placeholder="Información adicional sobre la recolección"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedResiduo(null);
                  setMensaje('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
