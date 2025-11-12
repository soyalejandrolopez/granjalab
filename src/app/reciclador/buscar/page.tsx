'use client';

import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Residuo } from '@/types/database.types';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/helpers';

export default function BuscarPage() {
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [selectedResiduo, setSelectedResiduo] = useState<Residuo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadResiduos();
    }
  }, [userId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const loadResiduos = async () => {
    const { data } = await supabase
      .from('residuos')
      .select('*, productor:productor_id(nombre, direccion, telefono)')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (data) {
      setResiduos(data as any);
    }
  };

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResiduo) return;

    setLoading(true);

    try {
      const insertData: any = {
        residuo_id: selectedResiduo.id,
        solicitante_id: userId,
        productor_id: selectedResiduo.productor_id,
        status: 'pendiente',
        mensaje,
      };
      // @ts-ignore
      const { error } = await supabase.from('solicitudes').insert(insertData);

      if (!error) {
        setIsModalOpen(false);
        setSelectedResiduo(null);
        setMensaje('');
        alert('¡Solicitud enviada exitosamente!');
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

  const filteredResiduos = residuos.filter((r) =>
    r.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.descripcion && r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      header: 'Productor',
      accessor: 'productor',
      cell: (value: any) => (
        <div>
          <div className="font-medium">{value?.nombre || 'N/A'}</div>
          <div className="text-xs text-gray-500">{value?.direccion || ''}</div>
        </div>
      ),
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
      header: 'Descripción',
      accessor: 'descripcion',
      cell: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      ),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Residuos Disponibles</h1>
        <p className="text-gray-600 mt-2">Busca y solicita residuos orgánicos disponibles</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por tipo o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <Card
        title={`Residuos Disponibles (${filteredResiduos.length})`}
        description="Residuos orgánicos disponibles para recolección"
      >
        <Table
          columns={columns}
          data={filteredResiduos}
          emptyMessage="No hay residuos disponibles"
        />
      </Card>

      {/* Modal */}
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
          <form onSubmit={handleSolicitar} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo:</span>
                <span className="text-sm font-medium">{selectedResiduo.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <span className="text-sm font-medium">{selectedResiduo.cantidad_kg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Productor:</span>
                <span className="text-sm font-medium">
                  {(selectedResiduo as any).productor?.nombre || 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje (opcional)
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Agrega un mensaje para el productor..."
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
