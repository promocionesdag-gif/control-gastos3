import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, DollarSign, Tag, CreditCard, Plus, Trash2, Download, Save, FileText } from 'lucide-react';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [formData, setFormData] = useState({
    fecha: '',
    gasto: '',
    tipo: '',
    categoria: '',
    formaPago: ''
  });

  const tipoOptions = ['Personal', 'Belyou', 'Sherman Morgan', 'Men Shop'];
  
  const categoriasEmprendimiento = ['insumos', 'publicidad', 'mantenimiento', 'pagos producto', 'envios', 'otro'];
  const categoriasPersonal = ['fijos', 'comida', 'transporte', 'gustos', 'salud', 'ahorro', 'viajes'];
  
  const formaPagoOptions = ['crédito', 'efectivo'];

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6366f1', '#14b8a6', '#f97316'];

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('expenses-data');
        if (result && result.value) {
          setExpenses(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No hay datos guardados previamente');
      }
    };
    loadData();
  }, []);

  // Guardar datos
  const saveData = async () => {
    try {
      await window.storage.set('expenses-data', JSON.stringify(expenses));
      alert('✅ Datos guardados correctamente');
    } catch (error) {
      alert('❌ Error al guardar los datos');
    }
  };

  const getCategorias = () => {
    return formData.tipo === 'Personal' ? categoriasPersonal : categoriasEmprendimiento;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      categoria: name === 'tipo' ? '' : prev.categoria
    }));
  };

  const handleSubmit = () => {
    if (formData.fecha && formData.gasto && formData.tipo && formData.categoria && formData.formaPago) {
      setExpenses(prev => [...prev, { ...formData, id: Date.now() }]);
      setFormData({
        fecha: '',
        gasto: '',
        tipo: '',
        categoria: '',
        formaPago: ''
      });
    }
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Obtener gastos filtrados según el modo de vista
  const getFilteredExpenses = () => {
    if (viewMode === 'all') return expenses;
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.fecha);
      return expenseDate >= startOfWeek;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  const getChartData = () => {
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      const amount = parseFloat(expense.gasto) || 0;
      if (categoryTotals[expense.categoria]) {
        categoryTotals[expense.categoria] += amount;
      } else {
        categoryTotals[expense.categoria] = amount;
      }
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const getWeeklyChartData = () => {
    const weeklyTotals = {};
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.fecha);
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
      const amount = parseFloat(expense.gasto) || 0;
      
      if (weeklyTotals[dayName]) {
        weeklyTotals[dayName] += amount;
      } else {
        weeklyTotals[dayName] = amount;
      }
    });

    const daysOrder = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return daysOrder.map(day => ({
      name: day,
      total: weeklyTotals[day] || 0
    }));
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.gasto) || 0), 0).toFixed(2);
  };

  // Exportar a Excel (CSV)
  const exportToExcel = () => {
    const headers = ['Fecha', 'Monto', 'Tipo', 'Categoría', 'Forma de Pago'];
    const rows = filteredExpenses.map(e => [
      e.fecha,
      e.gasto,
      e.tipo,
      e.categoria,
      e.formaPago
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gastos_${viewMode === 'week' ? 'semanal' : 'total'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const totalGastos = getTotalExpenses();
    
    printWindow.document.write('<html><head><title>Reporte de Gastos</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('h1 { color: #8b5cf6; text-align: center; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }');
    printWindow.document.write('th { background-color: #8b5cf6; color: white; }');
    printWindow.document.write('tr:nth-child(even) { background-color: #f9f9f9; }');
    printWindow.document.write('.total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #8b5cf6; }');
    printWindow.document.write('.subtitle { text-align: center; color: #666; margin-bottom: 20px; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    
    printWindow.document.write('<h1>📊 Reporte de Gastos</h1>');
    printWindow.document.write(`<p class="subtitle">${viewMode === 'week' ? 'Vista Semanal' : 'Vista Completa'} - ${new Date().toLocaleDateString('es-MX')}</p>`);
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr><th>Fecha</th><th>Monto</th><th>Tipo</th><th>Categoría</th><th>Forma de Pago</th></tr></thead>');
    printWindow.document.write('<tbody>');
    
    filteredExpenses.forEach(expense => {
      printWindow.document.write('<tr>');
      printWindow.document.write(`<td>${expense.fecha}</td>`);
      printWindow.document.write(`<td>$${parseFloat(expense.gasto).toFixed(2)}</td>`);
      printWindow.document.write(`<td>${expense.tipo}</td>`);
      printWindow.document.write(`<td>${expense.categoria}</td>`);
      printWindow.document.write(`<td>${expense.formaPago}</td>`);
      printWindow.document.write('</tr>');
    });
    
    printWindow.document.write('</tbody></table>');
    printWindow.document.write(`<p class="total">Total: $${totalGastos}</p>`);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.print();
  };

  const chartData = getChartData();
  const weeklyData = getWeeklyChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          📊 Registro de Gastos
        </h1>

        {/* Botones de control superior */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ver Todo
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'week' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vista Semanal
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={saveData}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Datos
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar Gasto</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha del Gasto
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Gasto */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Monto del Gasto
                </label>
                <input
                  type="number"
                  name="gasto"
                  value={formData.gasto}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 mr-2" />
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tipoOptions.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 mr-2" />
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!formData.tipo}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {getCategorias().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Forma de Pago
                </label>
                <select
                  name="formaPago"
                  value={formData.formaPago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar forma de pago</option>
                  {formaPagoOptions.map(forma => (
                    <option key={forma} value={forma}>{forma}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Gasto
            </button>
          </div>
        </div>

        {/* Lista de Gastos */}
        {filteredExpenses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Gastos Registrados {viewMode === 'week' && '(Esta Semana)'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.fecha}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">${parseFloat(expense.gasto).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{expense.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{expense.categoria}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{expense.formaPago}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <span className="text-lg font-bold text-gray-700">
                Total: <span className="text-purple-600">${getTotalExpenses()}</span>
              </span>
            </div>
          </div>
        )}

        {/* Gráficos */}
        {chartData.length > 0 && (
          <>
            {/* Gráfico de Pie */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gastos por Categoría</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico Semanal */}
            {viewMode === 'week' && weeklyData.some(d => d.total > 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gastos por Día de la Semana</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="total" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {filteredExpenses.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {viewMode === 'week' 
                ? 'No hay gastos registrados esta semana. ¡Agrega tu primer gasto!' 
                : 'No hay gastos registrados aún. ¡Agrega tu primer gasto!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;


