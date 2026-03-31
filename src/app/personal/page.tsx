'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import toast from 'react-hot-toast';

interface Transaction {
  id: number;
  amount: number;
  category_name: string;
  description: string;
  date: string;
  username: string;
}

export default function PersonalPage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    user_id: user?.id
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    const [incomesRes, expensesRes] = await Promise.all([
      fetch('/api/personal/incomes'),
      fetch('/api/personal/expenses')
    ]);
    setIncomes(await incomesRes.json());
    setExpenses(await expensesRes.json());
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = modalType === 'income' ? '/api/personal/incomes' : '/api/personal/expenses';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      toast.success(`${modalType === 'income' ? 'Ingreso' : 'Gasto'} registrado`);
      setShowModal(false);
      fetchData();
      setFormData({
        amount: '',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        user_id: user?.id
      });
    } else {
      toast.error('Error al registrar');
    }
  };

  const totalIncomes = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncomes - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finanzas Personales</h1>
            <p className="text-gray-600 mt-2">Gestiona tus ingresos y gastos individuales</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setModalType('income');
                setShowModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Ingreso
            </button>
            <button
              onClick={() => {
                setModalType('expense');
                setShowModal(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              + Gasto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Ingresos</h3>
            <p className="text-2xl font-bold text-green-600">${totalIncomes.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Gastos</h3>
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Balance Personal</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b">
              <h2 className="text-lg font-semibold text-green-800">Ingresos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs">Descripción</th>
                    <th className="px-4 py-3 text-right text-xs">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map(income => (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{new Date(income.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{income.category_name}</td>
                      <td className="px-4 py-2 text-sm">{income.description}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">
                        ${Number(income.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b">
              <h2 className="text-lg font-semibold text-red-800">Gastos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs">Descripción</th>
                    <th className="px-4 py-3 text-right text-xs">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{expense.category_name}</td>
                      <td className="px-4 py-2 text-sm">{expense.description}</td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">
                        ${Number(expense.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {modalType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}
              </h2>
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
                    {categories.filter(c => c.type === (modalType === 'income' ? 'income' : 'expense')).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.description}
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
