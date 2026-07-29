import React from 'react'
import FilterPanelDesktop from '../../../components/ui/Crud/FilterPanelDesktop'
import FilterPanelMobile from '../../../components/ui/Crud/FilterPanelMobile'
import Input from '../../../components/ui/Input'
import useMovimientoStore from '../../../store/movimientoStore'
import { TIPO_MOVIMIENTO, ORIGEN_MOVIMIENTO } from '../../../constants/movimientos'

export default function MovimientoFilters({ showFilters, onClose }) {
  const { filters, setFilters, clearFilters } = useMovimientoStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters({ [name]: value || null })
  }

  // Prevenir que el submit refresque la página
  const handleApply = (e) => {
    if (e) e.preventDefault()
    onClose()
  }

  // Los filtros se envían como children al FilterPanel
  const filterInputs = (
    <>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Código</label>
        <Input name="codigo" value={filters.codigo || ''} onChange={handleChange} placeholder="Ej. ZAP-001" className="text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Marca</label>
        <Input name="marca" value={filters.marca || ''} onChange={handleChange} placeholder="Ej. Nike" className="text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Categoría / Tipo</label>
        <Input name="tipoCalzado" value={filters.tipoCalzado || ''} onChange={handleChange} placeholder="Ej. Deportivo" className="text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Tipo Movimiento</label>
        <select 
          name="tipoMovimiento" 
          value={filters.tipoMovimiento || ''} 
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        >
          <option value="">Todos</option>
          <option value={TIPO_MOVIMIENTO.ENTRADA}>Entrada</option>
          <option value={TIPO_MOVIMIENTO.SALIDA}>Salida</option>
          <option value={TIPO_MOVIMIENTO.AJUSTE}>Ajuste</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Origen</label>
        <select 
          name="origen" 
          value={filters.origen || ''} 
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        >
          <option value="">Todos</option>
          {Object.entries(ORIGEN_MOVIMIENTO).map(([k, v]) => (
            <option key={k} value={v}>{v.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Fecha Inicio</label>
        <Input type="date" name="fechaInicio" value={filters.fechaInicio || ''} onChange={handleChange} className="text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Fecha Fin</label>
        <Input type="date" name="fechaFin" value={filters.fechaFin || ''} onChange={handleChange} className="text-sm" />
      </div>
    </>
  )

  return (
    <>
      <div className="hidden lg:block">
        <FilterPanelDesktop 
          showFilters={showFilters} 
          filters={filterInputs}
          onClear={clearFilters}
          onApply={handleApply}
        />
      </div>
      <div className="block lg:hidden">
        <FilterPanelMobile
          isOpen={showFilters}
          onClose={onClose}
          filters={filterInputs}
          onClear={clearFilters}
          onApply={handleApply}
        />
      </div>
    </>
  )
}
