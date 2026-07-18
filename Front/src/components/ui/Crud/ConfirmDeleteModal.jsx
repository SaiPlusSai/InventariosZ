import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, X } from 'lucide-react';
import Button from '../Button';
import productoService from '../../../services/productoService';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, onExportProductos, onExportMovimientos, previewData, isLoading }) {
  const [confirmText, setConfirmText] = useState('');
  const [hasExportedProductos, setHasExportedProductos] = useState(false);
  const [hasExportedMovimientos, setHasExportedMovimientos] = useState(false);
  const [isExportingProductos, setIsExportingProductos] = useState(false);
  const [isExportingMovimientos, setIsExportingMovimientos] = useState(false);
  
  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setHasExportedProductos(false);
      setHasExportedMovimientos(false);
      setIsExportingProductos(false);
      setIsExportingMovimientos(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allExportsDone = hasExportedProductos && hasExportedMovimientos;
  const isConfirmEnabled = allExportsDone && confirmText === 'ELIMINAR';

  const handleExportProductos = async () => {
    setIsExportingProductos(true);
    try {
      const success = await onExportProductos();
      if (success) setHasExportedProductos(true);
    } finally {
      setIsExportingProductos(false);
    }
  };

  const handleExportMovimientos = async () => {
    setIsExportingMovimientos(true);
    try {
      const success = await onExportMovimientos();
      if (success) setHasExportedMovimientos(true);
    } finally {
      setIsExportingMovimientos(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Eliminación Definitiva del Producto
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Main Warning */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-600 uppercase tracking-wider mb-2">
              ESTA ACCIÓN ES IRREVERSIBLE
            </h3>
            <p className="text-gray-600">
              La eliminación definitiva removerá permanentemente este producto y toda la información relacionada.
            </p>
          </div>

          {/* Dynamic Content */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Se eliminarán permanentemente:</h4>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : previewData ? (
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500 font-bold">✔</span> 
                  <span className="font-semibold">{previewData.productos}</span> Productos (Variantes)
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500 font-bold">✔</span> 
                  <span className="font-semibold">{previewData.imagenes}</span> Imágenes asociadas
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500 font-bold">✔</span> 
                  <span className="font-semibold">{previewData.precios}</span> Registros en historial de precios
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500 font-bold">✔</span> 
                  <span className="font-semibold">{previewData.movimientos}</span> Movimientos de inventario (Kardex)
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500 font-bold">✔</span> 
                  Cualquier registro dependiente
                </li>
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No se pudo cargar la vista previa.</p>
            )}
          </div>

          {/* Highlighted Client Warning */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <div className="flex gap-2">
              <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-orange-800 font-bold mb-1">⚠ IMPORTANTE</h4>
                <p className="text-orange-700 text-sm leading-relaxed">
                  La eliminación definitiva también eliminará todo el historial relacionado con este producto. 
                  Esto incluye movimientos de inventario, historial de precios, imágenes y cualquier registro asociado. 
                  <strong className="block mt-2">Una vez eliminados, estos datos NO podrán recuperarse.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation & Mandatory Export */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <h4 className="text-blue-800 font-bold flex items-center gap-1.5 mb-2">
                🔒 Requisitos de Seguridad
              </h4>
              <p className="text-blue-700 text-sm">
                Como medida de auditoría, es obligatorio generar ambos respaldos antes de proceder con la eliminación.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Product Export */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${hasExportedProductos ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>
                    ✓
                  </div>
                  <span className={`font-medium ${hasExportedProductos ? 'text-gray-900' : 'text-gray-600'}`}>
                    Respaldo administrativo del producto
                  </span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleExportProductos}
                  disabled={hasExportedProductos || isExportingProductos}
                  className={`flex-shrink-0 ${hasExportedProductos ? 'opacity-50' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-100'}`}
                >
                  {isExportingProductos ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  ) : (
                    <Download size={16} className="mr-2" />
                  )}
                  {hasExportedProductos ? 'Generado' : 'Generar'}
                </Button>
              </div>

              {/* Movements Export */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${hasExportedMovimientos ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>
                    ✓
                  </div>
                  <span className={`font-medium ${hasExportedMovimientos ? 'text-gray-900' : 'text-gray-600'}`}>
                    Respaldo operativo de movimientos
                  </span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleExportMovimientos}
                  disabled={hasExportedMovimientos || isExportingMovimientos}
                  className={`flex-shrink-0 ${hasExportedMovimientos ? 'opacity-50' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-100'}`}
                >
                  {isExportingMovimientos ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  ) : (
                    <Download size={16} className="mr-2" />
                  )}
                  {hasExportedMovimientos ? 'Generado' : 'Generar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Text Confirmation */}
          <div className={`pt-2 transition-opacity ${allExportsDone ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              <div className="flex items-center gap-2 mb-2">
                 <div className={`w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center border-2 ${isConfirmEnabled ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>✓</div>
                 <span>Para continuar, escriba la palabra <span className="font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">ELIMINAR</span>:</span>
              </div>
            </label>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              disabled={!allExportsDone}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all font-mono text-center text-lg tracking-widest outline-none uppercase placeholder:text-gray-300 placeholder:font-sans placeholder:tracking-normal disabled:bg-gray-100"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <Button variant="secondary" onClick={onClose} className="px-6">
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm} 
            disabled={!isConfirmEnabled || isLoading}
            className="px-6 font-semibold shadow-sm"
          >
            Eliminar definitivamente
          </Button>
        </div>

      </div>
    </div>
  );
}
