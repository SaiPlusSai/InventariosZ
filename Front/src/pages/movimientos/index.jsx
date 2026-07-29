import { useState, useEffect } from 'react'
import CrudHeader from '../../components/ui/CrudHeader'
import { ArrowRightLeft, Download, RefreshCw } from 'lucide-react'
import MovimientoTable from './components/MovimientoTable'
import MovimientoCard from './components/MovimientoCard'
import MovimientoFilters from './components/MovimientoFilters'
import useMovimientoStore from '../../store/movimientoStore'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '../../components/ui/EmptyState'

export default function MovimientosPage() {
  const { movimientos, loading, fetchMovimientos, filters, setFilters, pagination, sortConfig, clearFilters } = useMovimientoStore()
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovimientos()
    }, 300) // Debounce global para search y filtros

    return () => clearTimeout(timer)
  }, [filters, pagination.page, pagination.limit, sortConfig, fetchMovimientos])

  const handleSearch = (term) => {
    setFilters({ search: term })
  }

  const handleVerDetalle = (movimiento) => {
    navigate(`/movimientos/${movimiento.id}`)
  }

  const handleRefresh = () => {
    // console.log('Actualizar')
  }

  const handleExport = () => {
    // console.log('Exportar')
  }

  const getPrimaryActions = () => [
    {
      label: 'Actualizar',
      icon: RefreshCw,
      onClick: handleRefresh,
      variant: 'secondary'
    },
    {
      label: 'Exportar',
      icon: Download,
      onClick: handleExport,
      variant: 'primary'
    }
  ]

  const getActiveFilters = () => {
    const active = []
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
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'search' || !value) return;
      let displayValue = value;
      if (key === 'fechaInicio' || key === 'fechaFin') {
        try { displayValue = new Date(value).toLocaleDateString('es-ES') } catch (e) {}
      } else if (key === 'origen') {
        displayValue = value.replace('_', ' ')
      }
      active.push({ 
        label: keyMap[key] || key, 
        value: displayValue, 
        onRemove: () => setFilters({ [key]: key.includes('fecha') || key === 'tipoMovimiento' || key === 'origen' ? null : '' }) 
      })
    })
    return active
  }

  const listaMovimientos = Array.isArray(movimientos) ? movimientos : [];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative">
      <CrudHeader
        title="Movimientos de Inventario"
        description="Historial completo de entradas, salidas y ajustes."
        actions={getPrimaryActions()}
        searchConfig={{
          placeholder: "Buscar por código, producto, marca u observación...",
          value: filters.search || '',
          onChange: handleSearch,
          hideSearchButton: true
        }}
        filterConfig={{
          showFilters,
          onToggle: () => setShowFilters(!showFilters),
          onClear: clearFilters,
          onApply: () => setShowFilters(false),
          activeFilters: getActiveFilters(),
          filters: <MovimientoFilters />
        }}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {loading && listaMovimientos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Cargando movimientos...</p>
              </div>
            ) : listaMovimientos.length === 0 ? (
              <EmptyState
                icon={ArrowRightLeft}
                title="No existen movimientos registrados."
                description="Cuando se realice el primer movimiento aparecerá aquí."
              />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block">
                  <MovimientoTable 
                    movimientos={listaMovimientos} 
                    onVerDetalle={handleVerDetalle} 
                  />
                </div>

                {/* Mobile/Tablet View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                  {listaMovimientos.map(m => (
                    <MovimientoCard 
                      key={m.id} 
                      movimiento={m} 
                      onVerDetalle={handleVerDetalle}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
