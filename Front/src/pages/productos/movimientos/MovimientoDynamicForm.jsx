import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { ORIGENES_UI, SUB_ORIGENES_MERMA } from '../../../constants/movimientos';

const MovimientoDynamicForm = ({ tipo, onBack, onSubmit, loading, maxStock = 9999 }) => {
  const [formData, setFormData] = useState({
    origen: '',
    sub_origen: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalPayload = { ...formData, tipo_movimiento: tipo };

    // Si es merma, concatenamos el sub_origen al origen
    if (formData.origen === 'MERMA' && formData.sub_origen) {
      finalPayload.origen = `MERMA_${formData.sub_origen}`;
    }

    // Saneamiento del payload (Evitar 422 Unprocessable Entity)
    delete finalPayload.sub_origen;

    if (!finalPayload.documento_id || finalPayload.documento_id.trim() === '') {
      delete finalPayload.documento_id;
    } else {
      finalPayload.documento_id = Number(finalPayload.documento_id);
    }

    if (!finalPayload.documento_tipo || finalPayload.documento_tipo.trim() === '') {
      delete finalPayload.documento_tipo;
    }

    if (!finalPayload.observacion || finalPayload.observacion.trim() === '') {
      delete finalPayload.observacion;
    }

    onSubmit(finalPayload);
  };

  const isObservacionRequired = 
    formData.origen === 'MERMA' || 
    formData.origen === 'AJUSTE_MANUAL' || 
    formData.origen === 'OTRO';

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
            onChange={(e) => {
              handleChange(e);
              setFormData(prev => ({...prev, sub_origen: ''})); // Reset sub_origen if origen changes
            }}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione un motivo...</option>
            {ORIGENES_UI[tipo] && ORIGENES_UI[tipo].map(op => (
              <option key={op.id} value={op.id}>{op.label}</option>
            ))}
          </select>
        </div>

        {/* Sub Origen para Merma */}
        {formData.origen === 'MERMA' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Merma *</label>
            <select 
              name="sub_origen" 
              value={formData.sub_origen} 
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione tipo de merma...</option>
              {SUB_ORIGENES_MERMA.map(op => (
                <option key={op.id} value={op.id}>{op.label}</option>
              ))}
            </select>
          </div>
        )}

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
            max={isSalida ? maxStock : undefined}
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
        <Button type="submit" variant="primary" disabled={loading || !formData.origen || !formData.cantidad || (formData.origen === 'MERMA' && !formData.sub_origen)}>
          {loading ? 'Procesando...' : 'Confirmar Movimiento'}
        </Button>
      </div>

    </form>
  );
};

export default MovimientoDynamicForm;
