import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, X } from 'lucide-react';
import Button from '../Button';
import productoService from '../../../services/productoService';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, onExportExcel, previewData, isLoading }) {
  const [confirmText, setConfirmText] = useState('');
  
  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmEnabled = confirmText === 'ELIMINAR';

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

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h4 className="text-blue-800 font-bold flex items-center gap-1.5 mb-1">
                💡 Recomendación
              </h4>
              <p className="text-blue-700 text-sm">
                Antes de eliminar definitivamente, se recomienda realizar una exportación en Excel para conservar un respaldo.
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={onExportExcel}
              className="flex-shrink-0 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download size={16} className="mr-2" />
              Exportar a Excel
            </Button>
          </div>

          {/* Text Confirmation */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Para continuar, escriba la palabra <span className="font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">ELIMINAR</span>:
            </label>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all font-mono text-center text-lg tracking-widest outline-none uppercase placeholder:text-gray-300 placeholder:font-sans placeholder:tracking-normal"
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
