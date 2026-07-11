import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Settings } from 'lucide-react';

const MovimientoTypeSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div 
        onClick={() => onSelect('ENTRADA')}
        className="cursor-pointer border-2 border-green-200 hover:border-green-500 bg-green-50 rounded-xl p-6 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md"
      >
        <ArrowDownCircle size={48} className="text-green-600 mb-4" />
        <h3 className="font-bold text-green-900 text-lg">Entrada de Stock</h3>
        <p className="text-green-700 text-sm mt-2">Compras a proveedor o carga inicial de inventario.</p>
      </div>

      <div 
        onClick={() => onSelect('SALIDA')}
        className="cursor-pointer border-2 border-red-200 hover:border-red-500 bg-red-50 rounded-xl p-6 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md"
      >
        <ArrowUpCircle size={48} className="text-red-600 mb-4" />
        <h3 className="font-bold text-red-900 text-lg">Salida de Stock</h3>
        <p className="text-red-700 text-sm mt-2">Ventas rápidas, mermas, robos o productos dañados.</p>
      </div>

      <div 
        onClick={() => onSelect('AJUSTE')}
        className="cursor-pointer border-2 border-yellow-200 hover:border-yellow-500 bg-yellow-50 rounded-xl p-6 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md"
      >
        <Settings size={48} className="text-yellow-600 mb-4" />
        <h3 className="font-bold text-yellow-900 text-lg">Ajuste Manual</h3>
        <p className="text-yellow-700 text-sm mt-2">Cuadre de inventario físico (Faltantes o Sobrantes).</p>
      </div>
    </div>
  );
};

export default MovimientoTypeSelector;
