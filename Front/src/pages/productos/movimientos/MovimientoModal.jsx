import React, { useState } from 'react';
import { X } from 'lucide-react';
import MovimientoTypeSelector from './MovimientoTypeSelector';
import MovimientoDynamicForm from './MovimientoDynamicForm';
import useMovimientoStore from '../../../store/movimientoStore';
import toast from 'react-hot-toast';

const MovimientoModal = ({ isOpen, onClose, productoId, stockActual, onMovimientoRealizado }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null); // ENTRADA, SALIDA, AJUSTE
  const { registrarMovimiento, loading } = useMovimientoStore();

  if (!isOpen) return null;

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
  };

  const handleSubmit = async (payload) => {
    try {
      await registrarMovimiento({
        ...payload,
        producto_id: productoId,
        cantidad: Number(payload.cantidad)
      });
      toast.success('Movimiento registrado correctamente');
      onMovimientoRealizado(); // Refrescar detalles del producto
      onClose();
      // Reset state for next time
      setStep(1);
      setSelectedType(null);
    } catch (error) {
      // Error handled by store/toast
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden mx-4">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Registrar Movimiento de Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-2">
          {step === 1 && (
            <>
              <div className="p-4 text-center">
                <p className="text-gray-600 font-medium">Seleccione el tipo de operación que desea registrar en el Kardex.</p>
              </div>
              <MovimientoTypeSelector onSelect={handleSelectType} />
            </>
          )}

          {step === 2 && (
            <MovimientoDynamicForm 
              tipo={selectedType} 
              onBack={handleBack} 
              onSubmit={handleSubmit}
              loading={loading}
              maxStock={stockActual}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default MovimientoModal;
