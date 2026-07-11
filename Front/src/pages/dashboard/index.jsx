import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Package, ShoppingBag, ShoppingCart, AlertTriangle, CheckCircle, Tag, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    ventas_hoy: 0,
    compras_hoy: 0,
    perdidas_hoy: 0,
    total_productos: 0,
    total_marcas: 0,
    stock_total: 0,
    sin_stock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Métricas del día */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 transform group-hover:scale-110 transition-transform">
            <ShoppingBag size={120} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-gray-600 font-medium">Ventas de Hoy</h3>
          </div>
          <p className="text-4xl font-bold text-blue-700">{stats.ventas_hoy} <span className="text-lg font-normal text-gray-400">unid.</span></p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 transform group-hover:scale-110 transition-transform">
            <ShoppingCart size={120} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <TrendingDown size={24} />
            </div>
            <h3 className="text-gray-600 font-medium">Compras de Hoy</h3>
          </div>
          <p className="text-4xl font-bold text-green-700">{stats.compras_hoy} <span className="text-lg font-normal text-gray-400">unid.</span></p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 transform group-hover:scale-110 transition-transform">
            <AlertTriangle size={120} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-gray-600 font-medium">Mermas / Pérdidas</h3>
          </div>
          <p className="text-4xl font-bold text-red-700">{stats.perdidas_hoy} <span className="text-lg font-normal text-gray-400">unid.</span></p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 text-gray-700">Estado del Inventario</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
          <Package className="text-primary-500 mb-2" size={32} />
          <h3 className="text-gray-500 text-sm font-medium">Total Productos</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total_productos}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
          <Tag className="text-indigo-500 mb-2" size={32} />
          <h3 className="text-gray-500 text-sm font-medium">Total Marcas</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total_marcas}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
          <CheckCircle className="text-green-500 mb-2" size={32} />
          <h3 className="text-gray-500 text-sm font-medium">Stock Total Físico</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.stock_total}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100 bg-red-50 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="text-red-500 mb-2" size={32} />
          <h3 className="text-red-700 text-sm font-medium">Productos Sin Stock</h3>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.sin_stock}</p>
        </div>

      </div>
    </div>
  );
}
