import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { 
  Package, LayoutGrid, CheckCircle, XCircle, Trash2, 
  Archive, AlertTriangle, ArrowDownToLine, ArrowUpToLine,
  Tags, Layers, Palette, Ruler, FileImage, DollarSign,
  Activity, PieChart, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';

import BarChartCard from '../../components/dashboard/charts/BarChartCard';
import HorizontalBarChartCard from '../../components/dashboard/charts/HorizontalBarChartCard';
import PieChartCard from '../../components/dashboard/charts/PieChartCard';

// Componente para Skeleton Loading
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[1, 2, 3, 4].map(section => (
      <div key={section}>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(card => (
            <div key={card} className="bg-white p-4 rounded-xl border border-gray-100 h-28">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Componente Tarjeta KPI
const KpiCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bgColorClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
        setError(false);
      } catch (err) {
        console.error('Error cargando stats', err);
        toast.error('Error al cargar el dashboard');
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="w-6 h-6 text-blue-600 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-800">Cargando Indicadores...</h1>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error de Conexión</h2>
        <p className="text-gray-500">No se pudieron cargar los indicadores ejecutivos.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Cálculos matemáticos para gráficas de calidad (optimizando recursos del backend)
  const calidadImagenData = [
    { name: 'Con Imagen', value: stats.productos.activos - stats.calidad.sin_imagen_principal },
    { name: 'Sin Imagen', value: stats.calidad.sin_imagen_principal }
  ];

  const calidadPrecioData = [
    { name: 'Con Precio Vigente', value: stats.productos.activos - stats.calidad.sin_precio_vigente },
    { name: 'Sin Precio Vigente', value: stats.calidad.sin_precio_vigente }
  ];

  const calidadActivosData = [
    { name: 'Activos', value: stats.productos.activos },
    { name: 'Inactivos', value: stats.productos.inactivos }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Ejecutivo</h1>
          <p className="text-sm text-gray-500 mt-1">Visión general del estado actual del sistema</p>
        </div>
      </div>

      {/* SECCIÓN 1: PRODUCTOS */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Resumen de Productos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Productos" 
            value={stats.productos.total} 
            icon={LayoutGrid} 
            colorClass="text-indigo-600" 
            bgColorClass="bg-indigo-50" 
          />
          <KpiCard 
            title="Activos" 
            value={stats.productos.activos} 
            icon={CheckCircle} 
            colorClass="text-green-600" 
            bgColorClass="bg-green-50" 
          />
          <KpiCard 
            title="Inactivos" 
            value={stats.productos.inactivos} 
            icon={XCircle} 
            colorClass="text-gray-600" 
            bgColorClass="bg-gray-100" 
          />
          <KpiCard 
            title="En Papelera" 
            value={stats.productos.eliminados} 
            icon={Trash2} 
            colorClass="text-red-600" 
            bgColorClass="bg-red-50" 
          />
        </div>
      </section>

      {/* SECCIÓN 2: INVENTARIO */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Archive className="w-5 h-5 text-emerald-600" />
          Estado del Inventario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Stock Total" 
            value={stats.inventario.stock_total} 
            icon={Archive} 
            colorClass="text-emerald-600" 
            bgColorClass="bg-emerald-50" 
          />
          <KpiCard 
            title="Sin Stock" 
            value={stats.inventario.sin_stock} 
            icon={AlertTriangle} 
            colorClass="text-red-600" 
            bgColorClass="bg-red-50" 
          />
          <KpiCard 
            title="Stock Bajo (Crítico)" 
            value={stats.inventario.stock_bajo} 
            icon={ArrowDownToLine} 
            colorClass="text-orange-600" 
            bgColorClass="bg-orange-50" 
          />
          <KpiCard 
            title="Stock Máximo" 
            value={stats.inventario.stock_maximo} 
            icon={ArrowUpToLine} 
            colorClass="text-blue-600" 
            bgColorClass="bg-blue-50" 
          />
        </div>
      </section>

      {/* SECCIÓN 3: CATÁLOGO */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          Composición del Catálogo (Vigentes)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard 
            title="Marcas" 
            value={stats.catalogo.marcas} 
            icon={Tags} 
            colorClass="text-purple-600" 
            bgColorClass="bg-purple-50" 
          />
          <KpiCard 
            title="Tipos" 
            value={stats.catalogo.tipos_calzado} 
            icon={LayoutGrid} 
            colorClass="text-purple-600" 
            bgColorClass="bg-purple-50" 
          />
          <KpiCard 
            title="Materiales" 
            value={stats.catalogo.materiales} 
            icon={Layers} 
            colorClass="text-purple-600" 
            bgColorClass="bg-purple-50" 
          />
          <KpiCard 
            title="Colores" 
            value={stats.catalogo.colores} 
            icon={Palette} 
            colorClass="text-purple-600" 
            bgColorClass="bg-purple-50" 
          />
          <KpiCard 
            title="Tallas" 
            value={stats.catalogo.tallas} 
            icon={Ruler} 
            colorClass="text-purple-600" 
            bgColorClass="bg-purple-50" 
          />
        </div>
      </section>

      {/* SECCIÓN 2: DISTRIBUCIÓN DEL CATÁLOGO */}
      <section className="pt-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-indigo-600" />
          Análisis del Catálogo
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HorizontalBarChartCard 
            title="Productos por Marca" 
            subtitle="Distribución de modelos según marca"
            data={stats.distribucion_catalogo?.por_marca} 
            color="#6366F1"
          />
          <HorizontalBarChartCard 
            title="Productos por Tipo de Calzado" 
            subtitle="Distribución de modelos según tipo"
            data={stats.distribucion_catalogo?.por_tipo} 
            color="#8B5CF6"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BarChartCard 
            title="Productos por Material" 
            data={stats.distribucion_catalogo?.por_material} 
            color="#EC4899"
          />
          <BarChartCard 
            title="Productos por Color" 
            data={stats.distribucion_catalogo?.por_color} 
            color="#14B8A6"
          />
          <BarChartCard 
            title="Productos por Talla" 
            data={stats.distribucion_catalogo?.por_talla} 
            color="#F59E0B"
          />
        </div>
      </section>

      {/* SECCIÓN 3: DISTRIBUCIÓN DEL INVENTARIO */}
      <section className="pt-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-emerald-600" />
          Análisis del Inventario (Stock)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BarChartCard 
            title="Stock por Marca" 
            subtitle="Cantidad total de unidades disponibles"
            data={stats.distribucion_inventario?.por_marca} 
            color="#10B981"
          />
          <BarChartCard 
            title="Stock por Tipo" 
            subtitle="Cantidad total de unidades disponibles"
            data={stats.distribucion_inventario?.por_tipo} 
            color="#10B981"
          />
          <BarChartCard 
            title="Stock por Material" 
            subtitle="Cantidad total de unidades disponibles"
            data={stats.distribucion_inventario?.por_material} 
            color="#10B981"
          />
        </div>
      </section>

      {/* SECCIÓN 4: CALIDAD DEL CATÁLOGO (GRÁFICOS) */}
      <section className="pt-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-600" />
          Calidad de Datos (Analítica)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PieChartCard 
            title="Cobertura de Imágenes" 
            subtitle="Productos vigentes con imagen principal"
            data={calidadImagenData} 
            colors={['#10B981', '#EF4444']}
          />
          <PieChartCard 
            title="Cobertura de Precios" 
            subtitle="Productos vigentes con precio establecido"
            data={calidadPrecioData} 
            colors={['#3B82F6', '#EF4444']}
          />
          <PieChartCard 
            title="Estado del Catálogo" 
            subtitle="Proporción de productos activos vs inactivos"
            data={calidadActivosData} 
            colors={['#6366F1', '#9CA3AF']}
          />
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
