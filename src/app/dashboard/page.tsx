'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SummaryWidgets from '../../components/dashboard/SummaryWidgets';
import RecentMovements from '../../components/dashboard/RecentMovements';
import { DashboardData } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-3">
                Bienvenido, <span className="font-semibold text-[#8B2E3C]">{user?.username}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-[#8B2E3C] text-white rounded-lg hover:bg-[#6B2430] font-medium transition-all shadow-sm hover:shadow-md">
                📥 Importar
              </button>
              <button className="px-6 py-2 bg-white border-2 border-[#8B2E3C] text-[#8B2E3C] rounded-lg hover:bg-[#8B2E3C] hover:text-white font-medium transition-all">
                📊 Descargar
              </button>
            </div>
          </div>
        </div>

        {/* Widgets */}
        {data && <SummaryWidgets data={data} />}
        
        {/* Recent Movements */}
        <div className="mt-10">
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-[#8B2E3C]">
              Últimos Movimientos
            </h2>
            <RecentMovements movements={data?.recent_movements || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
