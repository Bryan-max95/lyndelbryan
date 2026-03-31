'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import toast from 'react-hot-toast';

interface JointExpense {
  id: number;
  amount: number;
  category_name: string;
  created_by_name: string;
  last_edited_by_name: string;
  created_at: string;
  deleted_at: string | null;
}

export default function JointPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<JointExpense[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    const res = await fetch('/api/joint/expenses');
    setExpenses(await res.json());
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const all = await res.json();
    setCategories(all.filter((c: any) => c.type === 'expense'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/joint/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      toast.success('Gasto conjunto registrado');
      setShowModal(false);
      fetchData();
      setFormData({
        amount: '',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      toast.error('Error al registrar');
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const perPerson = totalExpenses / 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gastos Conjuntos</h1>
            <p className="text-gray-600 mt-2">Gestiona los gastos compartidos de la pareja</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nuevo Gasto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Gastado</h3>
            <p className="text-2xl font-bold text-blue-600">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Por Persona (50%)</h3>
            <p className="text-2xl font-bold text-purple-600">${perPerson.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Número de Gastos</h3>
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b">
            <h2 className="text-lg font-semibold text-blue-800">Historial de Gastos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs">Registrado por</th>
                  <th className="px-4 py-3 text-left text-xs">Editado por</th>
                  <th className="px-4 py-3 text-right text-xs">Monto</th>
                </tr>
              </thead>
              <tbody>
                {expenses.filter(e => !e.deleted_at).map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{new Date(expense.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">{expense.category_name}</td>
                    <td className="px-4 py-2 text-sm">{expense.created_by_name}</td>
                    <td className="px-4 py-2 text-sm">{expense.last_edited_by_name}</td>
                    <td className="px-4 py-2 text-sm text-right text-blue-600">
                      ${Number(expense.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Registrar Gasto Conjunto</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
