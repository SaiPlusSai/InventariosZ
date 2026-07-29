import React, { useState, useEffect } from 'react'
import FilterPanelDesktop from '../../../components/ui/Crud/FilterPanelDesktop'
import FilterPanelMobile from '../../../components/ui/Crud/FilterPanelMobile'
import Input from '../../../components/ui/Input'
import useMovimientoStore from '../../../store/movimientoStore'
import { TIPO_MOVIMIENTO, ORIGEN_MOVIMIENTO } from '../../../constants/movimientos'

export default function MovimientoFilters({ showFilters, onClose }) {
  const { filters, setFilters, clearFilters } = useMovimientoStore()
  
  const [catalogos, setCatalogos] = useState({
    marcas: [], tipos: [], materiales: [], colores: [], tallas: [], codigos: []
  })

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [resMarcas, resTipos, resMateriales, resColores, resTallas, resCodigos] = await Promise.all([
          import('../../../services/marcaService').then(m => m.marcaService.getAll()),
          import('../../../services/tipoCalzadoService').then(m => m.tipoCalzadoService.getAll()),
          import('../../../services/materialService').then(m => m.materialService.getAll()),
          import('../../../services/colorService').then(m => m.colorService.getAll()),
          import('../../../services/tallaService').then(m => m.tallaService.getAll()),
          import('../../../services/codigoProductoService').then(m => m.codigoProductoService.getAll({ limit: 1000 }))
        ])
        setCatalogos({
          marcas: resMarcas.data || [],
          tipos: resTipos.data || [],
          materiales: resMateriales.data || [],
          colores: resColores.data || [],
          tallas: resTallas.data || [],
          codigos: resCodigos.data?.items || resCodigos.data || []
        })
      } catch (err) {
        console.error("Error cargando catálogos en filtros", err)
      }
    }
    fetchCatalogos()
  }, [])

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
    <div className="flex flex-col gap-4">
      {/* Fila 1: Código | Marca | Tipo | Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Código</label>
          <select name="codigo" value={filters.codigo || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todos</option>
            {catalogos.codigos.map(c => (
              <option key={c.id} value={c.codigo}>{c.codigo}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Marca</label>
          <select name="marca" value={filters.marca || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todas</option>
            {catalogos.marcas.map(m => (
              <option key={m.id} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Tipo / Categoría</label>
          <select name="tipoCalzado" value={filters.tipoCalzado || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todos</option>
            {catalogos.tipos.map(m => (
              <option key={m.id} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Color</label>
          <select name="color" value={filters.color || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todos</option>
            {catalogos.colores.map(m => (
              <option key={m.id} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fila 2: Material | Talla | Tipo Movimiento | Origen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Material</label>
          <select name="material" value={filters.material || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todos</option>
            {catalogos.materiales.map(m => (
              <option key={m.id} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Talla</label>
          <select name="talla" value={filters.talla || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todas</option>
            {catalogos.tallas.map(m => (
              <option key={m.id} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Tipo Movimiento</label>
          <select name="tipoMovimiento" value={filters.tipoMovimiento || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todos</option>
            <option value={TIPO_MOVIMIENTO.ENTRADA}>Entrada</option>
            <option value={TIPO_MOVIMIENTO.SALIDA}>Salida</option>
            <option value={TIPO_MOVIMIENTO.AJUSTE}>Ajuste</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Origen</label>
          <select name="origen" value={filters.origen || ''} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
            <option value="">Todos</option>
            {Object.entries(ORIGEN_MOVIMIENTO).map(([k, v]) => (
              <option key={k} value={v}>{v.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fila 3: Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Fecha Inicio</label>
          <Input type="date" name="fechaInicio" value={filters.fechaInicio || ''} onChange={handleChange} className="text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Fecha Fin</label>
          <Input type="date" name="fechaFin" value={filters.fechaFin || ''} onChange={handleChange} className="text-sm" />
        </div>
      </div>
    </div>
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
