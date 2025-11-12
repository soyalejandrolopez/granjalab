'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Residuo } from '@/types/database.types';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import StatsCard from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils/helpers';

export default function ResiduosPage() {
  const [residuos, setResiduos] = useState<Residuo[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadResiduos();
  }, []);

  const loadResiduos = async () => {
    const { data } = await supabase
      .from('residuos')
      .select('*, productor:productor_id(nombre)')
      .order('created_at', { ascending: false });

    if (data) {
      setResiduos(data as any);
    }
  };


  const totalKg = residuos.reduce((sum, r) => sum + Number(r.cantidad_kg), 0);
  const disponibles = residuos.filter(r => r.disponible).length;

  const columns = [
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Residuos</h1>
        <p className="text-gray-600 mt-2">Todos los residuos registrados en la plataforma</p>
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

    </div>
  );
}
