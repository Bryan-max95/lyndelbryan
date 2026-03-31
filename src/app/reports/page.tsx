'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  totalJointExpenses: number;
  weddingSpent: number;
  monthlyTrend: Array<{ month: string; income: number; expenses: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  incomeByCategory: Array<{ category: string; amount: number }>;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('3months'); // 1month, 3months, 6months, 1year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Cargando reportes...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Error cargando reportes</p>
      </div>
    );
  }

  const balance = reportData.totalIncome - reportData.totalExpenses - reportData.totalJointExpenses;
  const savingsRate = reportData.totalIncome > 0 ? ((balance / reportData.totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes Financieros</h1>
            <p className="text-gray-600 mt-3">Análisis detallado de tu situación financiera</p>
          </div>
          <div className="flex gap-2">
            {['1month', '3months', '6months', '1year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === p
                    ? 'bg-[#8B2E3C] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#8B2E3C]'
                }`}
              >
                {p === '1month' ? '1M' : p === '3months' ? '3M' : p === '6months' ? '6M' : '1A'}
              </button>
            ))}
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 border-[#8B2E3C]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ingresos Totales</p>
            <p className="text-3xl font-bold text-[#2d5016]">{formatCurrency(reportData.totalIncome)}</p>
            <p className="text-xs text-gray-500 mt-3">Período seleccionado</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 border-[#5c1a1a]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gastos Personales</p>
            <p className="text-3xl font-bold text-[#5c1a1a]">{formatCurrency(reportData.totalExpenses)}</p>
            <p className="text-xs text-gray-500 mt-3">Período seleccionado</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 border-[#1a3a52]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gastos Conjuntos</p>
            <p className="text-3xl font-bold text-[#1a3a52]">{formatCurrency(reportData.totalJointExpenses)}</p>
            <p className="text-xs text-gray-500 mt-3">Período seleccionado</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 border-[#8B2E3C]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tasa de Ahorro</p>
            <p className={`text-3xl font-bold ${parseFloat(savingsRate) > 0 ? 'text-[#8B2E3C]' : 'text-[#5c1a1a]'}`}>
              {formatPercentage(parseFloat(savingsRate))}
            </p>
            <p className="text-xs text-gray-500 mt-3">Del ingreso total</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Balance and Wedding */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen General</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Ingresos</span>
                <span className="text-lg font-semibold text-green-600">
                  +{formatCurrency(reportData.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Gastos Personales</span>
                <span className="text-lg font-semibold text-red-600">
                  -{formatCurrency(reportData.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Gastos Conjuntos</span>
                <span className="text-lg font-semibold text-blue-600">
                  -{formatCurrency(reportData.totalJointExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Gastos Boda</span>
                <span className="text-lg font-semibold text-pink-600">
                  -{formatCurrency(reportData.weddingSpent)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-900">Balance Neto</span>
                <span className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Distribution */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoría</h2>
            <div className="space-y-3">
              {reportData.expensesByCategory.slice(0, 8).map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{cat.category}</span>
                    <span className="text-sm font-semibold">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${(cat.amount / (reportData.expensesByCategory[0]?.amount || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Mensual</h2>
          <div className="space-y-3">
            {reportData.monthlyTrend.map((month, idx) => {
              const total = month.income + month.expenses;
              const incomePercent = total > 0 ? (month.income / total) * 100 : 0;
              const expensesPercent = total > 0 ? (month.expenses / total) * 100 : 0;
              
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="flex gap-3">
                      <span className="text-sm text-green-600">
                        Ingresos: {formatCurrency(month.income)}
                      </span>
                      <span className="text-sm text-red-600">
                        Gastos: {formatCurrency(month.expenses)}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 gap-1 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="bg-green-600"
                      style={{
                        width: `${incomePercent}%`
                      }}
                    />
                    <div
                      className="bg-red-600"
                      style={{
                        width: `${expensesPercent}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Exportar Reportes</h2>
              <p className="text-sm text-gray-600 mt-1">Descarga tus datos en diferentes formatos</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                📊 PDF
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                📈 Excel
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                📋 CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
