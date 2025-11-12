'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/ui/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function EstadisticasPage() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalResiduos: 0,
    totalSolicitudes: 0,
    totalKg: 0,
  });
  const [usuariosPorRol, setUsuariosPorRol] = useState<any[]>([]);
  const [residuosPorTipo, setResiduosPorTipo] = useState<any[]>([]);

  const supabase = createClient();
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    // Total usuarios
    const { data: usuarios } = await supabase.from('profiles').select('rol');
    
    // Total residuos y kg
    const { data: residuos } = await supabase.from('residuos').select('tipo, cantidad_kg');
    
    // Total solicitudes
    const { data: solicitudes } = await supabase.from('solicitudes').select('status');

    if (usuarios) {
      setStats(prev => ({ ...prev, totalUsuarios: usuarios.length }));
      
      // Agrupar por rol
      const rolCounts: any = {};
      usuarios.forEach((u: any) => {
        rolCounts[u.rol] = (rolCounts[u.rol] || 0) + 1;
      });
      
      setUsuariosPorRol([
        { name: 'Productores', value: rolCounts['productor'] || 0 },
        { name: 'Recicladores', value: rolCounts['reciclador'] || 0 },
        { name: 'Gestores', value: rolCounts['gestor'] || 0 },
        { name: 'Admins', value: rolCounts['admin'] || 0 },
      ]);
    }

    if (residuos) {
      const totalKg = residuos.reduce((sum: number, r: any) => sum + Number(r.cantidad_kg), 0);
      setStats(prev => ({ ...prev, totalResiduos: residuos.length, totalKg }));
      
      // Agrupar por tipo
      const tipoCounts: any = {};
      residuos.forEach((r: any) => {
        tipoCounts[r.tipo] = (tipoCounts[r.tipo] || 0) + 1;
      });
      
      const tiposData = Object.entries(tipoCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);
      
      setResiduosPorTipo(tiposData);
    }

    if (solicitudes) {
      setStats(prev => ({ ...prev, totalSolicitudes: solicitudes.length }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-600 mt-2">Métricas y reportes de la plataforma</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          value={`${stats.totalKg.toFixed(0)} kg`}
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios por Rol */}
        <Card title="Usuarios por Rol" description="Distribución de usuarios en la plataforma">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usuariosPorRol}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usuariosPorRol.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top 5 Residuos por Tipo */}
        <Card title="Top 5 Residuos por Tipo" description="Tipos de residuos más registrados">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={residuosPorTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
