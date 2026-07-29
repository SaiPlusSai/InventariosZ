import { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import CrudHeader from '../../components/ui/CrudHeader'
import SearchInput from '../../components/ui/Crud/SearchInput'
import FilterButton from '../../components/ui/Crud/FilterButton'
import ResponsiveHeaderActions from '../../components/ui/Crud/ResponsiveHeaderActions'
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
      icon: <RefreshCw size={20} />,
      onClick: handleRefresh,
      variant: 'secondary'
    },
    {
      label: 'Importar',
      icon: <Upload size={20} />,
      onClick: handleImport,
      variant: 'secondary'
    },
    {
      label: 'Exportar',
      icon: <Download size={20} />,
      onClick: handleExport,
      variant: 'primary'
    }
  ]

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative">
      <PageHeader 
        title="Movimientos de Inventario" 
        subtitle="Historial completo de entradas, salidas y ajustes."
      />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <CrudHeader>
          <div className="flex flex-col border-b border-gray-200/60 bg-white shadow-sm rounded-xl overflow-visible z-10 relative">
          <div className="p-3 lg:p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <SearchInput 
                  value={filters.search || ''}
                  onSearch={handleSearch}
                  placeholder="Buscar movimientos..."
                />
              </div>
              <ResponsiveHeaderActions 
                primaryActions={getPrimaryActions()} 
                secondaryActions={[]} 
              />
            </div>
          </div>

          <MovimientoFilters 
            showFilters={showFilters} 
            onClose={() => setShowFilters(false)} 
          />
        </div>
        
        <ActiveFilters />
        </CrudHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {loading && movimientos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Cargando movimientos...</p>
              </div>
            ) : movimientos.length === 0 ? (
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
                    movimientos={movimientos} 
                    onVerDetalle={handleVerDetalle} 
                  />
                </div>

                {/* Mobile/Tablet View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                  {movimientos.map(m => (
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
