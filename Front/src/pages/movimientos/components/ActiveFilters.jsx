import React from 'react'
import FilterChip from '../../../components/ui/FilterChip'
import useMovimientoStore from '../../../store/movimientoStore'
import { TIPO_MOVIMIENTO, ORIGEN_MOVIMIENTO } from '../../../constants/movimientos'

export default function ActiveFilters() {
  const { filters, setFilters, clearFilters } = useMovimientoStore()

  // Mapear filtros activos
  const activeChips = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false; // El buscador ya tiene su propio UI
    return value !== null && value !== '';
  });

  if (activeChips.length === 0) return null;

  const handleRemove = (key) => {
    setFilters({ [key]: key.includes('fecha') || key === 'tipoMovimiento' || key === 'origen' ? null : '' });
  }

  // Traductor amigable de claves a nombres legibles
  const getLabel = (key, value) => {
    const keyMap = {
      codigo: 'Código',
      marca: 'Marca',
      tipoCalzado: 'Tipo',
      material: 'Material',
      color: 'Color',
      talla: 'Talla',
      tipoMovimiento: 'Movimiento',
      origen: 'Origen',
      fechaInicio: 'Desde',
      fechaFin: 'Hasta',
      cantidadMin: 'Cant. Mín',
      cantidadMax: 'Cant. Máx',
      observacion: 'Observación'
    }

    let displayValue = value;
    if (key === 'fechaInicio' || key === 'fechaFin') {
      try {
        displayValue = new Date(value).toLocaleDateString('es-ES')
      } catch (e) {}
    } else if (key === 'origen') {
      displayValue = value.replace('_', ' ')
    }

    return `${keyMap[key] || key}: ${displayValue}`
  }

  return (
    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto custom-scrollbar min-h-[44px]">
      <div className="flex flex-nowrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider shrink-0 mr-1">Filtros:</span>
        {activeChips.map(([key, value]) => (
          <FilterChip 
            key={key}
            label={getLabel(key, value)}
            onRemove={() => handleRemove(key)}
          />
        ))}
        <button 
          onClick={clearFilters}
          className="shrink-0 ml-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
        >
          Limpiar todos
        </button>
      </div>
    </div>
  )
}
