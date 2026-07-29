import { useState, useEffect } from 'react'
import CrudHeader from '../../components/ui/CrudHeader'
import SearchInput from '../../components/ui/Crud/SearchInput'
import FilterButton from '../../components/ui/Crud/FilterButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ArrowRightLeft, Download, Upload, RefreshCw } from 'lucide-react'
import MovimientoTable from './components/MovimientoTable'
import MovimientoCard from './components/MovimientoCard'
import ActiveFilters from './components/ActiveFilters'
import MovimientoFilters from './components/MovimientoFilters'
import useMovimientoStore from '../../store/movimientoStore'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MovimientosPage() {
  const { movimientos, loading, fetchMovimientos, filters, setFilters, pagination, sortConfig } = useMovimientoStore()
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

  const handleImport = () => {
    // console.log('Importar')
  }

  const getPrimaryActions = () => [
    {
      label: 'Actualizar',
      icon: RefreshCw,
      onClick: handleRefresh,
      variant: 'secondary'
    },
    {
      label: 'Importar',
      icon: Upload,
      onClick: handleImport,
      variant: 'secondary'
    },
    {
      label: 'Exportar',
      icon: Download,
      onClick: handleExport,
      variant: 'primary'
    }
  ]

  const listaMovimientos = Array.isArray(movimientos) ? movimientos : [];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative">
      <CrudHeader
        title="Movimientos de Inventario"
        description="Historial completo de entradas, salidas y ajustes."
        actions={getPrimaryActions()}
        extraContent={
          <div className="flex flex-col">
            <div className="p-3 lg:p-4 flex flex-col gap-4 border-b border-gray-200/60 bg-white">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="w-full sm:w-auto">
                  <SearchInput 
                    value={filters.search || ''}
                    onSearch={handleSearch}
                    placeholder="Buscar movimientos..."
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <FilterButton 
                    onToggle={() => setShowFilters(!showFilters)} 
                    showFilters={showFilters}
                  />
                </div>
              </div>
            </div>
            <MovimientoFilters 
              showFilters={showFilters} 
              onClose={() => setShowFilters(false)} 
            />
            <ActiveFilters />
          </div>
        }
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
