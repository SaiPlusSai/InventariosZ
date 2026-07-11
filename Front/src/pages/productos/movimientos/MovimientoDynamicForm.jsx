import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const MovimientoDynamicForm = ({ tipo, onBack, onSubmit, loading, maxStock = 9999 }) => {
  const [formData, setFormData] = useState({
    origen: '',
    cantidad: '',
    observacion: '',
    documento_tipo: '',
    documento_id: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isSalida = tipo === 'SALIDA';
  const isEntrada = tipo === 'ENTRADA';
  const isAjuste = tipo === 'AJUSTE';

  // Opciones de origen basadas en el tipo seleccionado (MVP)
  const origenes = {
    ENTRADA: [
      { id: 'COMPRA', label: 'Compra a Proveedor' },
      { id: 'INVENTARIO_INICIAL', label: 'Carga Inicial' }
    ],
    SALIDA: [
      { id: 'VENTA', label: 'Venta Directa' },
      { id: 'MERMA_DANO', label: 'Merma (Daño)' },
      { id: 'MERMA_ROBO', label: 'Merma (Robo)' },
      { id: 'MERMA_PERDIDA', label: 'Merma (Pérdida)' }
    ],
    AJUSTE: [
      { id: 'SOBRANTE', label: 'Sobrante (Aumentar Stock)' },
      { id: 'FALTANTE', label: 'Faltante (Disminuir Stock)' }
    ]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalPayload = { ...formData, tipo_movimiento: tipo };

    // Mapeo lógico de ajuste
    if (isAjuste) {
      finalPayload.origen = 'AJUSTE_MANUAL';
      if (formData.origen === 'SOBRANTE') finalPayload.tipo_movimiento = 'ENTRADA';
      if (formData.origen === 'FALTANTE') finalPayload.tipo_movimiento = 'SALIDA';
    }

    onSubmit(finalPayload);
  };

  const isObservacionRequired = 
    isAjuste || 
    (isSalida && formData.origen?.startsWith('MERMA_'));

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Registrar {tipo.toLowerCase()}
        </h3>
        <button type="button" onClick={onBack} className="text-sm text-blue-600 hover:underline">
          Volver atrás
        </button>
      </div>

      <div className="space-y-4">
        {/* Motivo / Origen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Origen *</label>
          <select 
            name="origen" 
            value={formData.origen} 
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione un motivo...</option>
            {origenes[tipo].map(op => (
              <option key={op.id} value={op.id}>{op.label}</option>
            ))}
          </select>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad * {isSalida ? `(Max: ${maxStock})` : ''}
          </label>
          <input 
            type="number" 
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            required
            min="1"
            max={isSalida || (isAjuste && formData.origen === 'FALTANTE') ? maxStock : undefined}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 5"
          />
        </div>

        {/* Observacion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones {isObservacionRequired ? '*' : '(Opcional)'}
          </label>
          <textarea 
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            required={isObservacionRequired}
            rows="3"
            minLength={isObservacionRequired ? 10 : undefined}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={isObservacionRequired ? "Por favor justifique brevemente (min 10 caracteres)..." : "Notas adicionales..."}
          ></textarea>
        </div>

      </div>

      <div className="pt-4 flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onBack} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading || !formData.origen || !formData.cantidad}>
          {loading ? 'Procesando...' : 'Confirmar Movimiento'}
        </Button>
      </div>

    </form>
  );
};

export default MovimientoDynamicForm;
