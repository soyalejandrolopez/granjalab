'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Residuo } from '@/types/database.types';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils/helpers';

export default function ResiduosPage() {
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResiduo, setEditingResiduo] = useState<Residuo | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [formData, setFormData] = useState({
    tipo: '',
    cantidad_kg: '',
    descripcion: '',
    fecha_generacion: new Date().toISOString().split('T')[0],
    disponible: true,
  });

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
      .select('*')
      .eq('productor_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setResiduos(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingResiduo) {
        // Update
        const updateData: any = {
          tipo: formData.tipo,
          cantidad_kg: Number(formData.cantidad_kg),
          descripcion: formData.descripcion,
          fecha_generacion: formData.fecha_generacion,
          disponible: formData.disponible,
        };
        // @ts-ignore
        const { error } = await supabase
          .from('residuos')
          .update(updateData)
          .eq('id', editingResiduo.id);

        if (!error) {
          setIsModalOpen(false);
          setEditingResiduo(null);
          resetForm();
          loadResiduos();
        }
      } else {
        // Create
        const insertData: any = {
          productor_id: userId,
          tipo: formData.tipo,
          cantidad_kg: Number(formData.cantidad_kg),
          descripcion: formData.descripcion,
          fecha_generacion: formData.fecha_generacion,
          disponible: formData.disponible,
        };
        // @ts-ignore
        const { error } = await supabase.from('residuos').insert(insertData);

        if (!error) {
          setIsModalOpen(false);
          resetForm();
          loadResiduos();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (residuo: Residuo) => {
    setEditingResiduo(residuo);
    setFormData({
      tipo: residuo.tipo,
      cantidad_kg: residuo.cantidad_kg.toString(),
      descripcion: residuo.descripcion || '',
      fecha_generacion: residuo.fecha_generacion,
      disponible: residuo.disponible,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este residuo?')) {
      await supabase.from('residuos').delete().eq('id', id);
      loadResiduos();
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      cantidad_kg: '',
      descripcion: '',
      fecha_generacion: new Date().toISOString().split('T')[0],
      disponible: true,
    });
  };

  const openCreateModal = () => {
    setEditingResiduo(null);
    resetForm();
    setIsModalOpen(true);
  };

  const totalKg = residuos.reduce((sum, r) => sum + Number(r.cantidad_kg), 0);
  const disponibles = residuos.filter(r => r.disponible).length;

  const columns = [
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
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (_: string, row: Residuo) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Residuos</h1>
          <p className="text-gray-600 mt-2">Gestiona todos tus residuos orgánicos</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Residuo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Residuos"
          value={residuos.length}
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Disponibles"
          value={disponibles}
          icon={Package}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Total Kg"
          value={`${totalKg.toFixed(0)} kg`}
          icon={Package}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Table */}
      <Card title="Listado de Residuos" description="Todos tus residuos registrados">
        <Table columns={columns} data={residuos} emptyMessage="No hay residuos registrados" />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResiduo(null);
          resetForm();
        }}
        title={editingResiduo ? 'Editar Residuo' : 'Nuevo Residuo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Residuo *
            </label>
            <input
              type="text"
              required
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Cáscaras de frutas, restos vegetales"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad (kg) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={formData.cantidad_kg}
              onChange={(e) => setFormData({ ...formData, cantidad_kg: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Generación *
            </label>
            <input
              type="date"
              required
              value={formData.fecha_generacion}
              onChange={(e) => setFormData({ ...formData, fecha_generacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Descripción adicional (opcional)"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="disponible" className="ml-2 text-sm text-gray-700">
              Disponible para recolección
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingResiduo(null);
                resetForm();
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
              {loading ? 'Guardando...' : editingResiduo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
